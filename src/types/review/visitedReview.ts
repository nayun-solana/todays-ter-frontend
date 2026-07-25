/** GET /my-places/visited/{visitId} 응답 result */
export type VisitedReviewDetail = {
  visitId: number;
  placeId: number;
  placeName: string;
  visitVerifiedAt: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};
