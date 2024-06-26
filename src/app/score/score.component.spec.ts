import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreComponent } from './score.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ScoreComponent', () => {
  let component: ScoreComponent;
  let fixture: ComponentFixture<ScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScoreComponent,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 10 frames', () => {
    expect(component.frames.length).toBe(10);
  })

  it('should calculate score correctly for a strike', () => {
    component.frames = [
      [10, null],
      [3, 4],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null, null],
    ];
    const score = component.getScore();
    expect(score).toBe(24);
    // expect(component.getScore()).toBe(24);
    console.log('Strike score calc:');
    console.log('Frame 1 (Strike): 10 + 3 + 4 = 17');
    console.log('Frame 2: 3 + 4 = 7');
    console.log('Total: 17 + 7 = 24');
  })

  it('should calculate score correctly for a spare', () => {
    component.frames = [
      [5,5],
      [3,4],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null, null],
    ];
    expect(component.getScore()).toBe(20);
  })

  it('should calculate score correctly for a regular frames', () => {
    component.frames = [
      [4,5],
      [3,4],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null, null],
    ];
    expect(component.getScore()).toBe(16);
  })

  it('should move to next frame after a strike', () => {
    component.currentFrame = 0;
    component.frames[0] = [10, null];
    component.updateFrame(0);
    expect(component.currentFrame).toBe(1);
  })

  it('should move to next frame after two rolls', () => {
    component.currentFrame = 0;
    component.frames[0] = [3,4];
    component.updateFrame(0);
    expect(component.currentFrame).toBe(1)
  });

  it('should not allow total scorfe greater than 10 in a frame', () => {
    component.currentFrame = 0;
    component.frames[0] = [6,5];
    component.updateFrame(0);
    expect(component.frames[0][1]).toBeNull()
  })

  it('should allow three rolls in the 10th frame if first roll is strike', () => {
    component.currentFrame = 9;
    component.frames[9] = [10, 5, 3];
    component.updateFrame(0);
    expect(component.frames[9]).toEqual([10, 5, 3])
  })

  it('should allow three rolls in the 10th frame if first roll is spare', () => {
    component.currentFrame = 9;
    component.frames[9] = [5, 5, 3];
    component.updateFrame(0);
    expect(component.frames[9]).toEqual([5, 5, 3])
  })

  it('should calculate perfect game score correctly', () => {
    component.frames = [
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, null],
      [10, 10, 10]
    ];
    expect(component.getScore()).toBe(300)
  })


});
