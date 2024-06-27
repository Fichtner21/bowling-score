import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ScoreComponent } from './score.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ScoreComponent', () => {
  let component: ScoreComponent;
  let fixture: ComponentFixture<ScoreComponent>;
  let httpMock: HttpTestingController;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject({});
    await TestBed.configureTestingModule({
      imports: [
        ScoreComponent,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        HttpClientTestingModule 
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: {
              data: {
                animation: 'HomePage'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open')
          }
        }
      ],      
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScoreComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Dodaj to, aby upewnić się, że nie ma niezrealizowanych żądań
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 10 frames', () => {
    expect(component.frames.length).toBe(10);
  });

  it('should calculate score correctly for a strike', () => {
    component.frames = [
      { first: 10, second: null },
      { first: 3, second: 4 },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null, third: null }
    ];
    const score = component.getScore();
    expect(score).toBe(24);    
  });

  it('should calculate score correctly for a spare', () => {
    component.frames = [
      { first: 5, second: 5 },
      { first: 3, second: 4 },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null, third: null }
    ];
    expect(component.getScore()).toBe(20);
  });

  it('should calculate score correctly for regular frames', () => {
    component.frames = [
      { first: 4, second: 5 },
      { first: 3, second: 4 },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null },
      { first: null, second: null, third: null }
    ];
    expect(component.getScore()).toBe(16);
  });

  it('should move to next frame after a strike', () => {
    component.currentFrame = 0;
    component.frames[0] = { first: 10, second: null };
    component.updateFrame(0);
    expect(component.currentFrame).toBe(1);
  });

  it('should move to next frame after two rolls', () => {
    component.currentFrame = 0;
    component.frames[0] = { first: 3, second: 4 };
    component.updateFrame(0);
    expect(component.currentFrame).toBe(1);
  });

  it('should not allow total score greater than 10 in a frame', () => {
    component.currentFrame = 0;
    component.frames[0] = { first: 6, second: 5 };
    component.updateFrame(0);
    expect(component.frames[0].second).toBeNull();
  });

  it('should allow three rolls in the 10th frame if first roll is strike', () => {
    component.currentFrame = 9;
    component.frames[9] = { first: 10, second: 5, third: 3 };
    component.updateFrame(9);
    expect(component.frames[9]).toEqual({ first: 10, second: 5, third: 3 });
  });

  it('should allow three rolls in the 10th frame if first roll is spare', () => {
    component.currentFrame = 9;
    component.frames[9] = { first: 5, second: 5, third: 3 };
    component.updateFrame(9);
    expect(component.frames[9]).toEqual({ first: 5, second: 5, third: 3 });
  });

  it('should calculate perfect game score correctly', () => {
    component.frames = [
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: null },
      { first: 10, second: 10, third: 10 }
    ];
    expect(component.getScore()).toBe(300);
  });

  // it('should load game from JSON when queryParam is set', (done) => {
  //   // Zwiększamy limit czasu dla tego testu
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  //   // Ustawiamy spy na metodę loadGameFromJson
  //   spyOn(component, 'loadGameFromJson').and.callThrough();

  //   // Ustawiamy parametry zapytania
  //   queryParamsSubject.next({ loaded: 'true' });
    
  //   // Wywołujemy ngOnInit ręcznie
  //   component.ngOnInit();

  //   // Używamy setTimeout, aby dać czas na wykonanie asynchronicznych operacji
  //   setTimeout(() => {
  //     expect(component.loadGameFromJson).toHaveBeenCalled();

  //     const req = httpMock.expectOne('assets/game.json');
  //     expect(req.request.method).toBe('GET');
  //     req.flush({ 
  //       frames: [
  //         { first: 10, second: null },
  //         { first: 7, second: 3 },
  //       ] 
  //     });

  //     // Używamy setTimeout, aby dać czas na przetworzenie odpowiedzi
  //     setTimeout(() => {
  //       expect(component.isGameLoaded).toBeTrue();
  //       expect(component.frames.length).toBeGreaterThan(0);
  //       done();
  //     }, 100);
  //   }, 100);
  // });

  // it('should process game data when loaded', () => {
  //   const testData = {
  //     frames: [
  //       { first: 10, second: null, third: null },
  //       { first: 7, second: 3, third: null },
  //       // ... dodaj więcej ramek według potrzeb
  //     ]
  //   };

  //   component.processGameData(testData);

  //   expect(component.isGameLoaded).toBeTrue();
  //   expect(component.frames.length).toBe(testData.frames.length);
  //   expect(component.isHomePage).toBeFalse();
  // });

  it('should load game when queryParam is set', () => {
    spyOn(component, 'loadGameFromJson');
    queryParamsSubject.next({ loaded: 'true' });
    component.ngOnInit();
    expect(component.loadGameFromJson).toHaveBeenCalled();
  });

  it('should not load game when queryParam is not set', () => {
    spyOn(component, 'loadGameFromJson');
    queryParamsSubject.next({});
    component.ngOnInit();
    expect(component.loadGameFromJson).not.toHaveBeenCalled();
  });

  it('should initialize game when starting new game', () => {
    spyOn(component, 'initializeGame');
    component.startGame();
    expect(component.initializeGame).toHaveBeenCalled();
  });
  
});
