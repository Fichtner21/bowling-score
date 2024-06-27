import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Frame {
  first: number | null;
  second: number | null;
  third?: number | null; 
}

interface GameData {
  frames: Frame[];
}

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [
    FormsModule, 
    NgFor, 
    CommonModule, 
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    HttpClientModule
  ],
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent implements OnInit {
  frames: Frame[] = Array.from({ length: 10 }, (_, i) => (i === 9 ? { first: null, second: null, third: null } : { first: null, second: null }));
  showSecondRoll: boolean[] = Array(10).fill(false);
  currentFrame: number = 0;
  isHomePage: boolean = false;
  isGameLoaded: boolean = false;

  constructor(private cdr: ChangeDetectorRef, public dialog: MatDialog, private router: Router, private route: ActivatedRoute, private http: HttpClient,) {}

  ngOnInit(): void {   
    this.route.queryParams.subscribe(params => {      
      if (params['loaded'] === 'true') {        
        this.loadGameFromJson();
      } else {        
        this.isHomePage = this.route.snapshot.data['animation'] === 'HomePage';
      }
    });
  } 

  initializeGame() {
    this.frames = Array.from({ length: 10 }, (_, i) => (i === 9 ? { first: null, second: null, third: null } : { first: null, second: null }));
    this.showSecondRoll = Array(10).fill(false);
    this.currentFrame = 0;
    this.isGameLoaded = false;
  } 

  loadGameFromJson() {
    this.http.get<GameData>('assets/game.json').subscribe(
      (data) => this.processGameData(data),
      (error) => console.error('Error loading game:', error)
    );
  }

  processGameData(data: GameData) {    
    if (data && data.frames && Array.isArray(data.frames)) {
      this.frames = data.frames.map((frame, index) => ({
        first: frame.first,
        second: frame.second,
        third: index === 9 ? frame.third : null
      }));
      this.currentFrame = this.frames.findIndex(frame => frame.first === null || frame.second === null);
      if (this.currentFrame === -1) this.currentFrame = 10;
      this.showSecondRoll = this.frames.map(frame => frame.first !== null && frame.first < 10);
      this.isHomePage = false;
      this.isGameLoaded = true;
      this.cdr.detectChanges();
    } else {
      console.error('Invalid data format:', data);
    }
  }

  validateInput(event: any, frameIndex: number, rollIndex: 'first' | 'second' | 'third') {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);
    
    if (isNaN(value)) {
      input.value = '';
      return;
    }

    if (frameIndex === 9) {      
      if (rollIndex === 'first') {
        value = Math.max(0, Math.min(10, value));
      } else if (rollIndex === 'second') {
        if (this.frames[frameIndex].first === 10) {
          value = Math.max(0, Math.min(10, value));
        } else {
          value = Math.max(0, Math.min(10 - (this.frames[frameIndex].first ?? 0), value));
        }
      } else if (rollIndex === 'third') {
        if (this.frames[frameIndex].first === 10 || (this.frames[frameIndex].first ?? 0) + (this.frames[frameIndex].second ?? 0) === 10) {
          value = Math.max(0, Math.min(10, value));
        } else {
          input.value = '';
          return;
        }
      }
    } else {     
      if (rollIndex === 'first') {
        value = Math.max(0, Math.min(10, value));
      } else if (rollIndex === 'second') {
        value = Math.max(0, Math.min(10 - (this.frames[frameIndex].first ?? 0), value));
      }
    }

    input.value = value.toString();
    this.frames[frameIndex][rollIndex] = value;
  }

  updateFrame(frameIndex: number) {
    const currentFrame = this.frames[frameIndex];
  
    if (frameIndex < 9) {
      if (currentFrame.first !== null && currentFrame.first < 10) {
        this.showSecondRoll[frameIndex] = true;
      } else if (currentFrame.first === 10) {
        this.showSecondRoll[frameIndex] = false;
        currentFrame.second = null;
        this.moveToNextFrame(frameIndex);
      }      
     
      if (currentFrame.first !== null && currentFrame.second !== null) {
        const sum = currentFrame.first + currentFrame.second;
        if (sum > 10) {
          currentFrame.second = null; 
        } else {
          this.moveToNextFrame(frameIndex);
        }
      }
    } else if (frameIndex === 9) {
      this.showSecondRoll[frameIndex] = true;      
      
      if (currentFrame.first === 10) {        
      } else if (currentFrame.first !== null && currentFrame.second !== null) {
        const sum = currentFrame.first + currentFrame.second;
        if (sum === 10) {         
        } else if (sum < 10) {          
          this.currentFrame = 10;
        } else {
          currentFrame.second = null; 
        }
      }
    }    
    if (this.isFrameComplete(frameIndex) && frameIndex < 9) {
      this.currentFrame = frameIndex + 1;
    }

    this.frames = [...this.frames];
    this.cdr.detectChanges();
  }  
  
  moveToNextFrame(currentFrameIndex: number) {
    if (currentFrameIndex < 9) {
      this.currentFrame = currentFrameIndex + 1;
    }
  }
  
  isFrameSumValid(frameIndex: number): boolean {
    const frame = this.frames[frameIndex];
    if (frameIndex < 9) {
      return (frame.first ?? 0) + (frame.second ?? 0) <= 10;
    } else {      
      if (frame.first === 10 || (frame.first !== null && frame.second !== null && frame.first + frame.second === 10)) {
        return true; 
      } else {
        return (frame.first ?? 0) + (frame.second ?? 0) <= 10;
      }
    }
  }
  
  isFrameComplete(frameIndex: number): boolean {
    const frame = this.frames[frameIndex];
    if (frameIndex < 9) {
      return frame.first === 10 || (frame.first !== null && frame.second !== null);
    } else {
      if (frame.first === 10 || (frame.first !== null && frame.second !== null && frame.first + frame.second === 10)) {
        return frame.third !== null;
      } else {
        return frame.first !== null && frame.second !== null;
      }
    }
  }

  getFrameValue(frameIndex: number, rollIndex: 'first' | 'second' | 'third'): number {
    return this.frames[frameIndex]?.[rollIndex] ?? 0;
  }

  getSecondRollMax(frameIndex: number): number {
    const firstRoll = this.frames[frameIndex].first;
    if (frameIndex === 9) {
      return firstRoll === 10 ? 10 : 10 - (firstRoll ?? 0);
    }
    return firstRoll !== null ? 10 - firstRoll : 10;
  }

  getScore() {
    let score = 0;
    for (let i = 0; i < 10; i++) {
      const frame = this.frames[i];
      const { first, second } = frame;
  
      if (first === null) continue;
  
      if (first === 10) { // strike
        score += 10 + this.getStrikeBonus(i);
      } else if (first + (second || 0) === 10) { // spare
        score += 10 + this.getSpareBonus(i);
      } else {
        score += first + (second || 0);
      }
    }
    return score;
  }

  getStrikeBonus(frameIndex: number): number {
    if(frameIndex === 9){
      return (this.frames[9].second ?? 0) + (this.frames[9].third ?? 0);
    }
    const nextFrame = this.frames[frameIndex + 1];
    if (!nextFrame) return 0;
  
    const nextFirstRoll = nextFrame.first ?? 0;
    if(nextFirstRoll === 10 && frameIndex < 8) {
      const nextNextFrame = this.frames[frameIndex + 2];
      return 10 + (nextNextFrame?.first ?? 0);
    } else {
      return nextFirstRoll + (nextFrame.second ?? 0);
    }
  }

  getSpareBonus(frameIndex: number): number {
    if(frameIndex === 9){
      return this.frames[9].third ?? 0;
    }
    const nextFrame = this.frames[frameIndex + 1];
    return nextFrame?.first ?? 0;
  }

  openDialog(type: 'info' | 'reset') {
    let dialogData;
    if (type === 'info') {
      dialogData = {
        title: 'How to fill the score',
        content: 'Enter the number of pins knocked down in the appropriate input, move to the next ones with the cursor or by pressing ENTER',
        cancelText: 'Close',
        confirmText: 'OK'
      };
    } else if (type === 'reset') {
      dialogData = {
        title: 'Confirm reset',
        content: 'Are you sure you want to reset your game results?',
        cancelText: 'Reject',
        confirmText: 'Reset'
      };
    }

    const dialogRef = this.dialog.open(DialogContentComponent, {
      data: dialogData
    });

    if (type === 'reset') {
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.initializeGame();
        }
      });
    }
  }

  loadPredefinedGame() {
    this.router.navigate(['/score'], { queryParams: { loaded: 'true' } });
  }

  startGame() {    
    this.isHomePage = false;
    this.initializeGame();
    this.router.navigate(['/score']);
  } 

  goHome() {
    this.router.navigate(['/']);   
  }
}