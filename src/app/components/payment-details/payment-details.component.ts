import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { CountdownDirective } from '@app/directives/countdown';
import { CopyToClipboardDirective } from '@app/directives/copy-to-clipboard';
import { copyOutline, closeCircle, alertCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { PaymentSession } from '@app/core/proxy/proxy';

import { SkeletonDirective } from '@app/directives/skeleton.directive';
import { LoggerService } from '@app/core/logger/logger.service';
import { ToastService } from '@app/core/toast/toast.service';


import { PaymentStatusIconDirective, PaymentState } from '@app/directives/payment-status-icon/payment-status-icon.directive';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss'],
  standalone: true,
  imports: [IonSpinner,
    CommonModule,
    QRCodeComponent,
    IonIcon,
    CountdownDirective,
    CopyToClipboardDirective,
    SkeletonDirective,
    PaymentStatusIconDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsComponent implements OnChanges {

   private readonly toastService = inject(ToastService);
  @Input() session: PaymentSession | null = null;
  @Input() qrCodeData: string = '';
  @Input() isTimerExpired = false;
  @Input() displayMode: 'create' | 'result' = 'create';
  @Output() depositConfirmed = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() timerExpired = new EventEmitter<void>();
  @Input() isConfirming = false;

  public isLoading: boolean = true;
  public readonly isCopied = signal(false);

  constructor(
    private cdr: ChangeDetectorRef,
    private logger: LoggerService
  ) {
    addIcons({copyOutline,alertCircle,closeCircle});
  }

  public get paymentState(): PaymentState {
    if (!this.session?.paymentState) return 'InProgress';

    const state = this.session.paymentState.toLowerCase();

    if (state === 'paid' || state === 'success' || state === 'completed') {
      return 'Paid';
    } else if (state === 'failed' || state === 'error' || state === 'rejected') {
      return 'Failed';
    } else {
      return 'InProgress';
    }
  }

  public get statusTitle(): string {
    switch (this.paymentState) {
      case 'Paid':
        return 'Success';
      case 'Failed':
        return 'Failed';
      case 'InProgress':
        return 'Processing';
      default:
        return 'Processing';
    }
  }
  public get statusMessage(): string {
    switch (this.paymentState) {
      case 'Paid':
        return 'Payment Successful';
      case 'Failed':
        return 'Payment Failed';
      case 'InProgress':
        return 'Your payment is being processed';
      default:
        return 'Your payment is being processed';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      this.isLoading = !changes['session'].currentValue;

      const wasLoading = !changes['session'].previousValue && changes['session'].currentValue;
      if (wasLoading) {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 1500);
      } else {
        this.cdr.markForCheck();
      }
    }
  }

  get timerStatus(): 'status-ok' | 'status-warning' | 'status-danger' {
    if (!this.session || this.isTimerExpired) {
      return 'status-danger';
    }

    const expireAt = new Date(this.session.expireAt).getTime();
    const now = new Date().getTime();
    const timeLeftSeconds = (expireAt - now) / 1000;

    if (timeLeftSeconds > 300) {
      return 'status-ok';
    } else if (timeLeftSeconds > 60) {
      return 'status-warning';
    } else {
      return 'status-danger';
    }
  }

formatAmount(amount: number): string {
  return parseFloat(amount.toString())
    .toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 8 })
    .replace(/\.?0+$/, '');
}

  onTextCopied(success: boolean): void {
    if (success) {
      this.toastService.presentSuccess('Copied !');
    } else {
      this.logger.error('Failed to copy wallet address.');
    }
  }
}
