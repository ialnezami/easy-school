import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getSchedules() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    const url = new URL(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/schedules`
    );
    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
  }
  return [];
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const schedules = await getSchedules();

  // Group schedules by day
  const schedulesByDay = daysOfWeek.map((day) => ({
    day,
    schedules: schedules.filter((s: any) => s.dayOfWeek === day),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">View your class schedule</p>
      </div>

      <div className="space-y-4">
        {schedulesByDay.map(({ day, schedules: daySchedules }) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle>{day}</CardTitle>
            </CardHeader>
            <CardContent>
              {daySchedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes</p>
              ) : (
                <div className="space-y-2">
                  {daySchedules.map((schedule: any) => (
                    <div
                      key={schedule._id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{schedule.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.classId?.name || "N/A"}
                          {schedule.room && ` • Room ${schedule.room}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

