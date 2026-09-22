import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STAGE_DESCRIPTION,
  STAGE_LABEL,
  STAGE_ORDER,
  stageIndex,
  type Appointment,
} from "@/data/appointments";

export function StatusTimeline({ appointment }: { appointment: Appointment }) {
  const current = stageIndex(appointment.stage);

  return (
    <ol className="relative">
      {STAGE_ORDER.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        const event = appointment.events.find((e) => e.stage === stage);
        return (
          <li key={stage} className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
            {i < STAGE_ORDER.length - 1 && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-16px)] w-px",
                  done ? "bg-primary" : "bg-border",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-6 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary-soft text-primary",
                !done && !active && "border-border bg-surface text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
            </span>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p
                  className={cn(
                    "text-[14px] font-semibold",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {STAGE_LABEL[stage]}
                  {active && (
                    <span className="ml-2 rounded-sm bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Current
                    </span>
                  )}
                </p>
                {event && (
                  <span className="text-[12px] tabular-nums text-muted-foreground">
                    {event.at}
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-muted-foreground">
                {event?.note ?? STAGE_DESCRIPTION[stage]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function StageBadge({ stage }: { stage: Appointment["stage"] }) {
  const done = stage === "completed";
  const early = stage === "requested";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold",
        done && "border-match-excellent/40 bg-match-excellent/10 text-match-excellent",
        early && "border-match-partial/45 bg-match-partial/10 text-match-partial",
        !done && !early && "border-primary/30 bg-primary-soft text-primary",
      )}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}
