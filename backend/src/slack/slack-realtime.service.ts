import { Injectable, Logger } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { MeetingReactionEvent } from "./dto/meeting-reaction.dto";

@Injectable()
export class SlackRealtimeService {
  private readonly logger = new Logger(SlackRealtimeService.name);
  private readonly subjects = new Map<string, Subject<MeetingReactionEvent>>();
  private readonly connections = new Map<string, number>();

  public stream(meetingId: string): Observable<MeetingReactionEvent> {
    return new Observable<MeetingReactionEvent>((subscriber) => {
      const subject = this.getSubject(meetingId);
      const nextCount = (this.connections.get(meetingId) ?? 0) + 1;
      this.connections.set(meetingId, nextCount);
      this.logger.log(
        `SSE connected meetingId=${meetingId} connections=${nextCount}`
      );

      const sub = subject.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });

      return () => {
        sub.unsubscribe();
        const after = Math.max(0, (this.connections.get(meetingId) ?? 1) - 1);
        this.connections.set(meetingId, after);
        this.logger.log(
          `SSE disconnected meetingId=${meetingId} connections=${after}`
        );
      };
    });
  }

  public emit(meetingId: string, event: MeetingReactionEvent): void {
    this.logger.log(
      `Emit meetingId=${meetingId} messageId=${event.messageId} emoji=${event.emojiName} userId=${event.user?.id}`
    );
    this.getSubject(meetingId).next(event);
  }

  private getSubject(meetingId: string): Subject<MeetingReactionEvent> {
    const existing = this.subjects.get(meetingId);
    if (existing) return existing;
    const created = new Subject<MeetingReactionEvent>();
    this.subjects.set(meetingId, created);
    return created;
  }
}
