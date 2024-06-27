import { Routes } from '@angular/router';
import { ScoreComponent } from './score/score.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ScoreComponent,
    data: {
      animation: 'HomePage'
    }
  },
  {
    path: 'score',
    component: ScoreComponent,
    data: {
      animation: 'ScorePage'
    }
  }
];
