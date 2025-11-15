

import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { LoggerService } from '../../core/logger/logger.service';
import { ToastService } from '../../core/toast/toast.service';
import { HostedPageClient, PaymentSession } from '@proxy/proxy';
import { Subscription } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { PaymentDetailsComponent } from '@app/components/payment-details/payment-details.component';

import { TOKEN_INFO_MAP } from './crypto-info';
import { ResultPage } from '../results/results.component';
import { Title } from '@angular/platform-browser';



type LoadingState = { status: 'loading' };
type LoadedState = { status: 'loaded'; session: PaymentSession };
type ErrorState = { status: 'error'; error: string };

type CheckoutState = LoadingState | LoadedState  | ErrorState;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, PaymentDetailsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly logger = inject(LoggerService);
  private readonly toastService = inject(ToastService);
  private readonly hostedPageClient = inject(HostedPageClient);
  public readonly state = signal<CheckoutState>({ status: 'loading' });
  public readonly isTimerExpired = signal(false);
  public readonly isConfirming = signal(false);
  private readonly titleService = inject(Title);
  public readonly currentSession = computed(() => {
  const s = this.state();
  return s.status === 'loaded' ? s.session : null;
});


 public readonly displayMode = signal<'create' | 'result'>('create');



  private paymentSubscription?: Subscription;

  public readonly qrCodeData = computed<string>(() => {
    const currentState = this.state();
    if (currentState.status !== 'loaded') {
      return '';
    }
    return this.generateStandardQrCode(currentState.session);
  });

  private generateStandardQrCode(session: PaymentSession): string {
    if (!session) return '';
    try {
      const { receiverWalletAddress, cryptoAmount } = session;
      const { amount, cryptoNetwork } = cryptoAmount;

      if (!cryptoNetwork?.blockchain || !receiverWalletAddress || amount === undefined) {
        throw new Error('Missing required data for QR code generation.');
      }

      const formattedAmount = Number(amount).toString();
      const scheme = cryptoNetwork.blockchain.toLowerCase();

      // Correct format: scheme:address?amount=value
      return `${scheme}:${receiverWalletAddress}?amount=${formattedAmount}`;

    } catch (err) {
      return session.receiverWalletAddress || '';
    }
  }

  ngOnInit() {
    this.fetchPaymentSessionFromQueryParams();
  }

  private updatePageTitle(): void {
    if (this.displayMode() === 'create') {
      this.titleService.setTitle('Pay with Crypto');
    } else {
      this.titleService.setTitle('Payment Result');
    }
  }


  public fetchPaymentSessionFromQueryParams(): void {
    this.paymentSubscription = this.route.queryParamMap.pipe(
      map(params => {
        const appId = params.get('appId');
        const paymentKey = params.get('paymentKey');
        if (!appId || !paymentKey) {
          throw new Error('Required query parameters "appId" or "paymentKey" are missing.');
        }
        return { appId: Number(appId), paymentKey };
      }),

      switchMap(({ appId, paymentKey }) => {
        this.state.set({ status: 'loading' });
        return this.hostedPageClient.getPaymentSession(appId, paymentKey).pipe(
          tap(session => {
            const validState = 'Created';
            if (session.paymentState !== validState) {
              this.displayMode.set('result');
              this.updatePageTitle();
              this.router.navigate(['/result'], {
                queryParams: { appId, paymentKey },
                replaceUrl: true,
              });
            } else {
            session.createdTime = new Date(session.createdTime + 'Z');
            session.expireAt = new Date(session.expireAt + 'Z');
              this.displayMode.set('create');
              this.updatePageTitle();
              this.state.set({ status: 'loaded', session });
            }

          }),
          catchError(error => {
            this.logger.error('Critical error in checkout stream', error);
            this.router.navigate(['/not-found']);
            return [];
          })
        );
      }),

      catchError(error => {
        this.logger.error('Critical error in checkout stream', error);
        this.router.navigate(['/not-found']);
        return [];
      })

    ).subscribe();
  }


  onTimerExpired(): void {
    this.isTimerExpired.set(true);
    this.toastService.presentError('Payment time has expired. You will be redirected.');
    const currentState = this.state();
    if (currentState.status === 'loaded' && currentState.session.returnUrl) {
      setTimeout(() => { if(currentState.session.returnUrl) window.location.href = currentState.session.returnUrl; }, 5000);
    } else {
      this.logger.error('Timer expired but no returnUrl was found in the session.');
    }
  }

  onDepositConfirmed(): void {
    const currentState = this.state();
    if (currentState.status !== 'loaded') {
      return;
    }
    const appIdParam = this.route.snapshot.queryParams['appId'];
    const paymentKeyParam = this.route.snapshot.queryParams['paymentKey'];
    if (!appIdParam || !paymentKeyParam) {
      this.toastService.presentError('An error occurred. Cannot refresh status.');
      return;
    }
    this.isConfirming.set(true);
    this.paymentSubscription?.unsubscribe();
    this.paymentSubscription = this.hostedPageClient.refreshStatus(Number(appIdParam), paymentKeyParam).subscribe({
      next: (refreshedPayment) => {
        if (refreshedPayment && refreshedPayment.returnUrl) {
          setTimeout(() => {
            window.location.href = refreshedPayment.returnUrl!;
          }, 1500);
        } else {
          this.isConfirming.set(false);
        }
      },
      error: (err) => {
        this.logger.error('Failed to refresh status', err);
        this.isConfirming.set(false);
      }
    });
  }



  onCancel(): void {
    const currentState = this.state();
    if (currentState.status === 'loaded' && currentState.session.returnUrl) {
      window.location.href = currentState.session.returnUrl;
    } else {
      this.logger.warn('Return to store clicked, but no returnUrl found. Falling back to location.back().');
      this.location.back();
    }
  }

  ngOnDestroy() {
    if (this.paymentSubscription) {
      this.paymentSubscription.unsubscribe();
    }
  }
}
