import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule
  ],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss'
})
export class ScoreComponent implements OnInit {
  frames: (number | null)[][] = Array.from({length: 10}, (_, i) => (i === 9 ? [null, null, null] : [null, null]));  
  showSecondRoll: boolean[] = Array(10).fill(false);
  currentFrame: number = 0;

  constructor(private cdr: ChangeDetectorRef){}
  ngOnInit(): void {
    this.initializeGame();
    // setTimeout(() => {
    //   this.testScoring()
    //   console.log('FRAMES', this.frames)
    // }, 5000)   
  } 

  initializeGame() {
    this.frames = Array.from({ length: 10 }, (_, i) => (i === 9 ? [null, null, null] : [null, null]));
    this.showSecondRoll = Array(10).fill(false);
    this.currentFrame = 0;
  }

  updateFrame(frameIndex: number) {
    const currentFrame = this.frames[frameIndex];
  
    if (frameIndex < 9) {
      if (currentFrame[0] !== null && currentFrame[0] < 10) {
        this.showSecondRoll[frameIndex] = true;
      } else if (currentFrame[0] === 10) {
        this.showSecondRoll[frameIndex] = false;
        currentFrame[1] = null;
        this.moveToNextFrame(frameIndex);
      }      
     
      if (currentFrame[0] !== null && currentFrame[1] !== null) {
        const sum = currentFrame[0] + currentFrame[1];
        if (sum > 10) {
          currentFrame[1] = null; 
        } else {
          this.moveToNextFrame(frameIndex);
        }
      }
    } else if (frameIndex === 9) {
      this.showSecondRoll[frameIndex] = true;      
      
      if (currentFrame[0] === 10) {        
      } else if (currentFrame[0] !== null && currentFrame[1] !== null) {
        const sum = currentFrame[0] + currentFrame[1];
        if (sum === 10) {         
        } else if (sum < 10) {          
          this.currentFrame = 10;
        } else {
          currentFrame[1] = null; 
        }
      }
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
      return (frame[0] ?? 0) + (frame[1] ?? 0) <= 10;
    } else {      
      if (frame[0] === 10 || (frame[0] !== null && frame[1] !== null && frame[0] + frame[1] === 10)) {
        return true; 
      } else {
        return (frame[0] ?? 0) + (frame[1] ?? 0) <= 10;
      }
    }
  }
  
  isFrameComplete(frameIndex: number): boolean {
    const frame = this.frames[frameIndex];
    if (frameIndex < 9) {
      return frame[0] === 10 || (frame[0] !== null && frame[1] !== null);
    } else {      
      if (frame[0] === 10 || (frame[0] !== null && frame[1] !== null && frame[0] + frame[1] === 10)) {
        return frame[2] !== null;
      } else {
        return frame[0] !== null && frame[1] !== null;
      }
    }
  }

  getFrameValue(frameIndex: number, rollIndex: number): number {
    return this.frames[frameIndex]?.[rollIndex] ?? 0;
  }

  getSecondRollMax(frameIndex: number): number {
    const firstRoll = this.frames[frameIndex][0];
    if (frameIndex === 9) {
      return firstRoll === 10 ? 10 : 10 - (firstRoll ?? 0);
    }
    return firstRoll !== null ? 10 - firstRoll : 10;
  }

  getScore() {
    let score = 0;
    for (let i = 0; i < 10; i++) {
      const frame = this.frames[i];
      const [firstRoll, secondRoll] = frame;
  
      if (firstRoll === null) continue;
  
      if (firstRoll === 10) { // strike
        score += 10 + this.getStrikeBonus(i);
      } else if (firstRoll + (secondRoll || 0) === 10) { // spare
        score += 10 + this.getSpareBonus(i);
      } else {
        score += firstRoll + (secondRoll || 0);
      }
    }
    return score;
  }

  getStrikeBonus(frameIndex: number): number {
    // if (frameIndex >= 9) return 0;
    if(frameIndex === 9){
      return (this.frames[9][1] ?? 0) + (this.frames[9][2] ?? 0)
    }
    const nextFrame = this.frames[frameIndex + 1];
    if (!nextFrame) return 0;
  
    const nextFirstRoll = nextFrame[0] ?? 0;
    // if (nextFirstRoll === 10) {
    //   const nextNextFrame = this.frames[frameIndex + 2];
    //   return 10 + (nextNextFrame?.[0] ?? 0);
    // } else {
    //   return nextFirstRoll + (nextFrame[1] ?? 0);
    // }
    if(nextFirstRoll === 10 && frameIndex < 8) {
      const nextNextFrame = this.frames[frameIndex + 2];
      return 10 + (nextNextFrame?.[0] ?? 0)
    } else {
      return nextFirstRoll + (nextFrame[1] ?? 0)
    }
  }

  getSpareBonus(frameIndex: number): number {
    // if(frameIndex >= 9) return 0;
    if(frameIndex === 9){
      return this.frames[9][2] ?? 0;
    }
    const nextFrame = this.frames[frameIndex + 1];
    return nextFrame?.[0] ?? 0;
  }

  testScoring() {
    this.frames = [
      [8, 2],  // First frame: strike
      [5, 5],      // Second frame: spare
      [null, null],  // Rest of the frames
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null, null]
    ];
    this.currentFrame = 2; 
    this.showSecondRoll = [true, true, false, false, false, false, false, false, false, true];
    console.log("Score after two frames:", this.getScore());
    this.cdr.detectChanges(); 
  }
}
