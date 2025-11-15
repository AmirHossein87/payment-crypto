import { Directive, Input, Output, EventEmitter, OnDestroy, ElementRef, Renderer2, HostBinding, NgZone, SimpleChanges, OnChanges } from '@angular/core';

type CountdownStatus = 'neutral' | 'ok' | 'warning' | 'danger';

@Directive({
  selector: '[appCountdown]',
  standalone: true,
})
export class CountdownDirective implements OnChanges, OnDestroy {

  @Input('appCountdown') expiryDate: Date | null | undefined;
  @Input() createdDate: Date | null | undefined;

  @Output() timerExpired = new EventEmitter<void>();

  @HostBinding('class.expired')
  public isExpired = false;

  private timerId?: number;
  private totalDurationSeconds = 0;
  private dotElement: HTMLElement | null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    this.dotElement = this.el.nativeElement.parentElement?.querySelector('.dot') ?? null;
    this.initializeDisplay();
  }

  private initializeDisplay(): void {
    this.updateDisplay('--:--');
    this.updateDotStatus('neutral');
  }

  ngOnChanges(changes: SimpleChanges): void {
    const expiryChange = changes['expiryDate'];

    if (expiryChange && expiryChange.currentValue instanceof Date) {
      this.cleanup();
      this.runSetup();
    } else if (expiryChange && !expiryChange.currentValue) {
      this.cleanup();
      this.initializeDisplay();
    }
  }

  private runSetup(): void {
    this.calculateTotalDuration();
    this.startCountdown();
  }

private calculateTotalDuration(): void {
  this.totalDurationSeconds = 0;

  if (
    this.createdDate instanceof Date &&
    this.expiryDate instanceof Date &&
    !isNaN(this.createdDate.getTime()) &&
    !isNaN(this.expiryDate.getTime())
  ) {
    const createdUTC = this.createdDate.getTime();
    const expiryUTC = this.expiryDate.getTime();
    this.totalDurationSeconds = Math.floor((expiryUTC - createdUTC) / 1000);
  }
}


 private startCountdown(): void {
  if (!this.expiryDate || isNaN(this.expiryDate.getTime())) {
    this.handleInvalidState(`Invalid expiry Date object received.`);
    return;
  }

  const expiryUTC = this.expiryDate.getTime();
  const tick = () => {
    const nowUTC = Date.now();
    const remainingSeconds = Math.floor((expiryUTC - nowUTC) / 1000);

    this.ngZone.run(() => {
      if (remainingSeconds <= 0) {
        this.handleExpiredState();
      } else {
        this.updateDisplayAndDot(remainingSeconds);
      }
    });
  };

  tick();
  this.ngZone.runOutsideAngular(() => {
    this.timerId = window.setInterval(tick, 1000);
  });
}


  private handleExpiredState(): void {
    this.cleanup();
    this.updateDisplay('00:00');
    this.updateDotStatus('danger');
    if (!this.isExpired) {
      this.isExpired = true;
      this.timerExpired.emit();
    }
  }

  private handleInvalidState(errorMessage: string): void {
    console.error(errorMessage);
    this.cleanup();
    this.updateDisplay('00:00');
    this.updateDotStatus('danger');
    if (!this.isExpired) {
      this.isExpired = true;
      this.timerExpired.emit();
    }
  }

  private updateDisplayAndDot(remainingSeconds: number): void {
    const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
    const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
    this.updateDisplay(`${minutes}:${seconds}`);

    if (this.totalDurationSeconds > 0) {
      const fiftyPercent = this.totalDurationSeconds * 0.5;
      const twentyPercent = this.totalDurationSeconds * 0.2;

      if (remainingSeconds <= twentyPercent) this.updateDotStatus('danger');
      else if (remainingSeconds <= fiftyPercent) this.updateDotStatus('warning');
      else this.updateDotStatus('ok');
    }
  }

  private updateDotStatus(status: CountdownStatus): void {
    if (!this.dotElement) return;
    this.dotElement.className = 'dot';
    this.renderer.addClass(this.dotElement, `status-${status}`);
  }

  private updateDisplay(text: string): void {
    this.renderer.setProperty(this.el.nativeElement, 'textContent', text);
  }

  private cleanup(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
