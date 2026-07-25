import { z } from 'zod';

export const MyPageResponse = z.object({
  nickname: z.string().min(1),
  profileImageUrl: z.string().url().nullable(),
  email: z.string().email(),
});
export type MyPageResponse = z.infer<typeof MyPageResponse>;

const SocialProvider = z.enum(['KAKAO', 'NAVER', 'APPLE']);

export const SocialConnectionsResponse = z.object({
  connections: z.array(
    z.object({
      provider: SocialProvider,
      isLinked: z.boolean(),
      linkedEmail: z.string().email().nullable(),
      linkedAt: z.string().nullable(),
    }),
  ),
});
export type SocialConnectionsResponse = z.infer<typeof SocialConnectionsResponse>;
