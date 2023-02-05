export interface RouteInfo {
    title: string;
    asset: string;
}
export type RouteInfoWithPath = RouteInfo & { path: string };
