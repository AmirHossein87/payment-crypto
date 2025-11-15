import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { LoggerService } from '../../core/logger/logger.service';
import { ToastService } from '../../core/toast/toast.service';
import { HostedPageClient, PaymentSession } from '@proxy/proxy';
import { switchMap, catchError, map } from 'rxjs/operators';
import { PaymentDetailsComponent } from '@app/components/payment-details/payment-details.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  standalone: true,
  imports: [IonSpinner, CommonModule, IonContent, PaymentDetailsComponent,NotFoundComponent],
})
export class ResultPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly logger = inject(LoggerService);
  private readonly toastService = inject(ToastService);
  private readonly hostedPageClient = inject(HostedPageClient);
  private readonly titleService = inject(Title)
  public readonly session = signal<PaymentSession | null>(null);
  public readonly isLoading = signal(true);

  ngOnInit() {
    this.titleService.setTitle('Payment Result');
    this.fetchPaymentSession();
  }

  public fetchPaymentSession(): void {
    this.route.queryParamMap.pipe(
      map(params => {
        const appId = params.get('appId');
        const paymentKey = params.get('paymentKey');
        if (!appId || !paymentKey) {
          throw new Error('Required query parameters "appId" or "paymentKey" are missing.');
        }
        return { appId: Number(appId), paymentKey };
      }),
      switchMap(({ appId, paymentKey }) =>
        this.hostedPageClient.getPaymentSession(appId, paymentKey)
      )
    ).subscribe({
      next: (session) => {
        this.session.set(session);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.logger.error('Error fetching payment session in result page', error);
        // this.toastService.presentError('Failed to load payment result.');
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    const currentSession = this.session();
    if (currentSession && currentSession.returnUrl) {
      window.location.href = currentSession.returnUrl;
    } else {
      this.location.back();
    }
  }
}
