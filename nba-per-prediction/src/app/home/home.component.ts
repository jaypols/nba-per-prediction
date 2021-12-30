import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [NgbCarouselConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, AfterViewChecked {
  activeSlide: number;
  static count: number = -1;

  constructor(config: NgbCarouselConfig, private cdRef: ChangeDetectorRef) {
    config.interval = 20000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = true;
  }

  ngOnInit(): void {
    HomeComponent.count += 1;
    console.log('count ' + HomeComponent.count);
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
    // this.setSlide();
  }

  setSlide() {
    const slide = document.querySelector('.active');
    this.activeSlide = Number(slide.id.split('-')[2]);
    this.activeSlide = this.activeSlide - 3 * HomeComponent.count;
  }
}
