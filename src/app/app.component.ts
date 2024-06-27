import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ScoreComponent } from './score/score.component';
import { MatButtonModule } from '@angular/material/button';
import { transition, trigger, style, animate } from '@angular/animations';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ opacity: 0}),
        animate('1000ms ease-in', style({ opacity: 1}))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'bowling-score';
  @ViewChild(RouterOutlet) outlet!: RouterOutlet;

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
