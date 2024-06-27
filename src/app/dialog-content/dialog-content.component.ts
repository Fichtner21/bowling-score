// dialog-content.component.ts
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-content',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.content }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onNoClick()">{{ data.cancelText || 'Anuluj' }}</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>{{ data.confirmText || 'OK' }}</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ]
})
export class DialogContentComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      content: string;
      cancelText?: string;
      confirmText?: string;
    }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
