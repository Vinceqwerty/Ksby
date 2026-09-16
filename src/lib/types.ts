export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "driver" | "passenger" | "both";
  rating_avg: number;
  trip_count: number;
};

export type Route = {
  id: string;
  driver_id: string;
  origin_label: string;
  destination_label: string;
  schedule_days: string[] | null;
  schedule_time: string | null;
  seats_available: number;
  cost_share: number | null;
  active: boolean;
};

export type RouteSearchResult = {
  route_id: string;
  driver_id: string;
  driver_name: string | null;
  origin_label: string;
  destination_label: string;
  schedule_days: string[] | null;
  schedule_time: string | null;
  seats_available: number;
  cost_share: number | null;
  origin_fraction: number;
  destination_fraction: number;
};
