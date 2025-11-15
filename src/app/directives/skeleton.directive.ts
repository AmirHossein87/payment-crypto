import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSkeleton]',
  standalone: true,
  host: {
    '[class.skeleton-loading]': 'appSkeleton',
  }
})
export class SkeletonDirective implements OnChanges {

  @Input() appSkeleton: boolean = false;


  @Input() skWidth: string = '100%';
  @Input() skHeight: string = '1rem';
  @Input() skCircle: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSkeleton'] || changes['skWidth'] || changes['skHeight'] || changes['skCircle']) {
      this.updateSkeleton();
    }
  }

  private updateSkeleton(): void {
    const host = this.el.nativeElement as HTMLElement;

    if (this.appSkeleton) {

      this.renderer.setStyle(host, 'width', this.skWidth);
      this.renderer.setStyle(host, 'height', this.skHeight);
      this.renderer.setStyle(host, 'color', 'transparent');
      this.renderer.setStyle(host, 'user-select', 'none');
      this.renderer.setStyle(host, 'pointer-events', 'none');

      if (this.skCircle) {
        this.renderer.setStyle(host, 'border-radius', '50%');
      } else {
        this.renderer.setStyle(host, 'border-radius', '4px');
      }

      Array.from(host.children).forEach(child => {
        this.renderer.setStyle(child, 'visibility', 'hidden');
      });

    } else {
      this.renderer.removeStyle(host, 'width');
      this.renderer.removeStyle(host, 'height');
      this.renderer.removeStyle(host, 'color');
      this.renderer.removeStyle(host, 'user-select');
      this.renderer.removeStyle(host, 'pointer-events');
      this.renderer.removeStyle(host, 'border-radius');

      Array.from(host.children).forEach(child => {
        this.renderer.removeStyle(child, 'visibility');
      });
    }
  }
}
