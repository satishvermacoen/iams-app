"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useFacultyOfferingsMe() {
    return useQuery({
        queryKey: ["faculty-offerings-me"],
        queryFn: async () => {
            const data = await apiGet("/api/me/faculty");
            return {
                items: data.offerings || [],
                todaySessions: data.todaySessions || [],
                upcomingExams: data.upcomingExams || [],
                faculty: data.faculty
            };
        },
    });
}
