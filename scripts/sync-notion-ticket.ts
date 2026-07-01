import { readFileSync } from 'node:fs';

const NOTION_VERSION = '2026-03-11';
const TICKET_PREFIX = 'todays-ter';
const BRANCH_PATTERN = /^feature\/todays-ter-(\d+)$/;

const PROPERTY = {
  title: '이름',
  status: '상태',
  ticketId: '티켓 ID',
  assignee: '담당자',
  part: '파트',
  github: 'GitHub',
  dueDate: '마감일',
  issueNumber: 'Issue Number',
  branch: 'Branch',
  pullRequest: 'Pull Request',
  repository: 'Repository',
  type: 'Type',
  mergedAt: 'Merged At',
  lastSyncedAt: 'Last Synced At',
} as const;

const TYPE_BY_LABEL: Record<string, string> = {
  bug: 'fix',
  chore: 'chore',
  design: 'design',
  docs: 'docs',
  feature: 'feature',
  fix: 'fix',
  refactor: 'refactor',
  test: 'test',
};

type Json = Record<string, unknown>;

type TicketStatus = '이슈' | '진행 중' | '리뷰 중' | '완료';

type TicketPatch = {
  assignee?: string;
  branch?: string;
  githubUrl?: string;
  issueNumber: number;
  mergedAt?: string;
  part?: string[];
  pullRequestUrl?: string;
  repository?: string;
  status: TicketStatus;
  ticketId: string;
  title: string;
  type?: string;
};

const notionToken = process.env.NOTION_TOKEN;
const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
const eventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!notionToken) {
  throw new Error('NOTION_TOKEN is required.');
}

if (!dataSourceId) {
  throw new Error('NOTION_DATA_SOURCE_ID is required.');
}

if (!eventName) {
  throw new Error('GITHUB_EVENT_NAME is required.');
}

if (!eventPath) {
  throw new Error('GITHUB_EVENT_PATH is required.');
}

const payload = JSON.parse(readFileSync(eventPath, 'utf8'));

async function main() {
  if (eventName === 'issues') {
    await handleIssueEvent(payload);
    return;
  }

  if (eventName === 'create') {
    await handleCreateEvent(payload);
    return;
  }

  if (eventName === 'pull_request') {
    await handlePullRequestEvent(payload);
    return;
  }

  console.log(`No Notion sync handler for event: ${eventName}`);
}

async function handleIssueEvent(event: Json) {
  const issue = event.issue as Json | undefined;

  if (!issue || typeof issue.number !== 'number') {
    throw new Error('Issue payload is missing issue.number.');
  }

  const labels = readLabels(issue);
  const issueNumber = issue.number;
  const ticketId = toTicketId(issueNumber);

  await upsertTicket({
    assignee: readAssignees(issue) || readLogin(issue.user as Json | undefined),
    githubUrl: readString(issue.html_url),
    issueNumber,
    part: readPart(labels),
    repository: readString((event.repository as Json | undefined)?.full_name),
    status: '이슈',
    ticketId,
    title: readString(issue.title) || ticketId,
    type: readType(readString(issue.title), labels),
  });
}

async function handleCreateEvent(event: Json) {
  if (event.ref_type !== 'branch') {
    console.log(`Skipping create event for ref_type=${String(event.ref_type)}`);
    return;
  }

  const branchName = readString(event.ref);
  const ticket = parseTicketBranch(branchName);

  if (!ticket) {
    console.log(`Skipping branch without ticket pattern: ${branchName}`);
    return;
  }

  await upsertTicket({
    branch: branchName,
    issueNumber: ticket.issueNumber,
    repository: readString((event.repository as Json | undefined)?.full_name),
    status: '진행 중',
    ticketId: ticket.ticketId,
    title: `${ticket.ticketId} 작업`,
  });
}

async function handlePullRequestEvent(event: Json) {
  const pullRequest = event.pull_request as Json | undefined;

  if (!pullRequest || typeof pullRequest.number !== 'number') {
    throw new Error('Pull request payload is missing pull_request.number.');
  }

  const branchName = readString((pullRequest.head as Json | undefined)?.ref);
  const ticket = parseTicketBranch(branchName);

  if (!ticket) {
    console.log(`Skipping PR from branch without ticket pattern: ${branchName}`);
    return;
  }

  const action = readString(event.action);
  const merged = Boolean(pullRequest.merged);
  const closed = action === 'closed';

  await upsertTicket({
    branch: branchName,
    githubUrl: readString(pullRequest.html_url),
    issueNumber: ticket.issueNumber,
    mergedAt: merged ? readString(pullRequest.merged_at) || new Date().toISOString() : undefined,
    pullRequestUrl: readString(pullRequest.html_url),
    repository: readString((event.repository as Json | undefined)?.full_name),
    status: merged ? '완료' : closed ? '진행 중' : '리뷰 중',
    ticketId: ticket.ticketId,
    title: readString(pullRequest.title) || `${ticket.ticketId} PR`,
    type: readType(readString(pullRequest.title), []),
  });
}

async function upsertTicket(ticket: TicketPatch) {
  const existingPageId = await findTicketPageId(ticket.ticketId);
  const properties = toPageProperties(ticket, !existingPageId);

  if (existingPageId) {
    await notionRequest('PATCH', `/v1/pages/${existingPageId}`, { properties });
    console.log(`Updated Notion ticket ${ticket.ticketId}: ${ticket.status}`);
    return;
  }

  await notionRequest('POST', '/v1/pages', {
    parent: {
      type: 'data_source_id',
      data_source_id: dataSourceId,
    },
    properties,
  });
  console.log(`Created Notion ticket ${ticket.ticketId}: ${ticket.status}`);
}

async function findTicketPageId(ticketId: string): Promise<string | undefined> {
  const response = await notionRequest('POST', `/v1/data_sources/${dataSourceId}/query`, {
    filter: {
      property: PROPERTY.ticketId,
      rich_text: {
        equals: ticketId,
      },
    },
    page_size: 1,
  });

  const results = Array.isArray(response.results) ? response.results : [];
  const firstPage = results[0] as Json | undefined;
  return readString(firstPage?.id) || undefined;
}

async function notionRequest(method: string, path: string, body?: Json): Promise<Json> {
  const response = await fetch(`https://api.notion.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as Json) : {};

  if (!response.ok) {
    const message = readString(json.message) || response.statusText;
    throw new Error(`Notion API ${method} ${path} failed: ${response.status} ${message}`);
  }

  return json;
}

function toPageProperties(ticket: TicketPatch, includeTitle: boolean): Json {
  const properties: Json = {
    [PROPERTY.status]: selectProperty(ticket.status),
    [PROPERTY.ticketId]: richTextProperty(ticket.ticketId),
    [PROPERTY.issueNumber]: { number: ticket.issueNumber },
    [PROPERTY.lastSyncedAt]: dateProperty(new Date().toISOString()),
  };

  if (includeTitle) {
    properties[PROPERTY.title] = titleProperty(ticket.title);
  }

  assignIfDefined(properties, PROPERTY.assignee, ticket.assignee, richTextProperty);
  assignIfDefined(properties, PROPERTY.branch, ticket.branch, richTextProperty);
  assignIfDefined(properties, PROPERTY.github, ticket.githubUrl, urlProperty);
  assignIfDefined(properties, PROPERTY.pullRequest, ticket.pullRequestUrl, urlProperty);
  assignIfDefined(properties, PROPERTY.repository, ticket.repository, richTextProperty);
  assignIfDefined(properties, PROPERTY.type, ticket.type, selectProperty);
  assignIfDefined(properties, PROPERTY.mergedAt, ticket.mergedAt, dateProperty);

  if (ticket.part?.length) {
    properties[PROPERTY.part] = {
      multi_select: ticket.part.map((name) => ({ name })),
    };
  }

  return properties;
}

function assignIfDefined<T>(
  properties: Json,
  name: string,
  value: T | undefined,
  toProperty: (value: T) => Json,
) {
  if (value !== undefined && value !== '') {
    properties[name] = toProperty(value);
  }
}

function titleProperty(content: string): Json {
  return {
    title: [{ type: 'text', text: { content: truncate(content) } }],
  };
}

function richTextProperty(content: string): Json {
  return {
    rich_text: [{ type: 'text', text: { content: truncate(content) } }],
  };
}

function selectProperty(name: string): Json {
  return {
    select: { name },
  };
}

function urlProperty(url: string): Json {
  return { url };
}

function dateProperty(start: string): Json {
  return {
    date: { start },
  };
}

function parseTicketBranch(branchName: string) {
  const match = branchName.match(BRANCH_PATTERN);

  if (!match) {
    return undefined;
  }

  const issueNumber = Number(match[1]);
  return {
    issueNumber,
    ticketId: toTicketId(issueNumber),
  };
}

function toTicketId(issueNumber: number) {
  return `${TICKET_PREFIX}-${issueNumber}`;
}

function readLabels(issue: Json): string[] {
  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  return labels
    .map((label) => {
      if (typeof label === 'string') {
        return label;
      }

      return readString((label as Json).name);
    })
    .filter(Boolean)
    .map((label) => label.toLowerCase());
}

function readAssignees(issue: Json) {
  const assignees = Array.isArray(issue.assignees) ? issue.assignees : [];
  return assignees
    .map((assignee) => readLogin(assignee as Json))
    .filter(Boolean)
    .join(', ');
}

function readLogin(user: Json | undefined) {
  return readString(user?.login) || readString(user?.name);
}

function readPart(labels: string[]) {
  const parts = ['frontend', 'backend', 'fullstack', 'infra'].filter((part) => labels.includes(part));
  return parts.length ? parts : ['frontend'];
}

function readType(title: string, labels: string[]) {
  for (const label of labels) {
    const type = TYPE_BY_LABEL[label];

    if (type) {
      return type;
    }
  }

  const match = title.match(/^\s*(?:\[)?(feat|feature|fix|docs|chore|design|refactor|test)(?:\])?\s*:?/i);
  const token = match?.[1]?.toLowerCase();

  if (!token) {
    return undefined;
  }

  return token === 'feat' ? 'feature' : token;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function truncate(content: string) {
  return content.length > 2000 ? content.slice(0, 1997) + '...' : content;
}

await main();
