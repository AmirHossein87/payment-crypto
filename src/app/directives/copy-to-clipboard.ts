import { Directive, Input, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true,
})
export class CopyToClipboardDirective {
  @Input('appCopyToClipboard') textToCopy!: string;
  @Output() copied = new EventEmitter<boolean>();

  @HostListener('click')
  async onClick() {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available.');
      }
      await navigator.clipboard.writeText(this.textToCopy);
      this.copied.emit(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);

      this.fallbackCopyTextToClipboard(this.textToCopy);
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      this.copied.emit(successful);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      this.copied.emit(false);
    }
    document.body.removeChild(textArea);
  }
}
