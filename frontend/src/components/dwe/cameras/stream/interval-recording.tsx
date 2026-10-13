import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useDeviceStore } from "@/store/devices";
import { useEffect, useState } from "react";

export const IntervalRecording = ({
  bus_id,
  disabled,
  onChange,
}: {
  bus_id: string;
    disabled: boolean;
    onChange: (recording_interval: number, recording_length: number) => void;
}) => {
  const isStreamLoading = useDeviceStore(
    (state) => state.isStreamLoading[bus_id] ?? false,
  );

  // A value of 0 means the device records normally (no interval)
  const savedInterval = useDeviceStore(
    (state) => state.devices[bus_id]?.stream.recording_interval ?? 0,
  );
  const savedLength = useDeviceStore(
    (state) => state.devices[bus_id]?.stream.recording_length ?? 0,
  );

  const [enabled] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(savedInterval);
  const [durationSeconds, setDurationSeconds] = useState(savedLength);

  // Keep the inputs in sync with the device when it is updated elsewhere
  useEffect(() => setIntervalSeconds(savedInterval), [savedInterval]);
  useEffect(() => setDurationSeconds(savedLength), [savedLength]);

  const isDisabled = disabled || isStreamLoading;
  const isContinuous = intervalSeconds === 0 || durationSeconds === 0;
  const isValid = isContinuous || durationSeconds < intervalSeconds;

  const parseSeconds = (value: string) => Math.max(0, parseInt(value) || 0);

  const submit = () => {
    if (!isValid) return;
    if (intervalSeconds === savedInterval && durationSeconds === savedLength)
      return;
    onChange(intervalSeconds, durationSeconds);
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="interval recording">
        <AccordionTrigger className="text-sm font-semibold">
          Interval Recording
        </AccordionTrigger>
        <AccordionContent className="w-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {/*<Label
                htmlFor={`interval-recording-${bus_id}`}
                className="text-sm"
              >
                Enable interval recording
              </Label>*/}
              {/*<Switch
                id={`interval-recording-${bus_id}`}
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={isDisabled}
              />*/}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Every (seconds)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={intervalSeconds}
                  disabled={isDisabled || !enabled}
                  onChange={(e) =>
                    setIntervalSeconds(parseSeconds(e.target.value))
                  }
                  onBlur={submit}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Record for (seconds)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={durationSeconds}
                  disabled={isDisabled || !enabled}
                  onChange={(e) =>
                    setDurationSeconds(parseSeconds(e.target.value))
                  }
                  onBlur={submit}
                />
              </div>
            </div>

            {isContinuous ? (
              <div className="text-sm text-muted-foreground p-4 rounded-md bg-muted/50">
                Records continuously. Set both values above 0 to record on an
                interval.
              </div>
            ) : isValid ? (
              <div className="text-sm text-muted-foreground p-4 rounded-md bg-muted/50">
                Records for {durationSeconds} second
                {durationSeconds === 1 ? "" : "s"} every {intervalSeconds}{" "}
                second{intervalSeconds === 1 ? "" : "s"}.
              </div>
            ) : (
              <div className="text-sm text-destructive p-4 rounded-md bg-destructive/10">
                Recording duration must be shorter than the interval.
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
