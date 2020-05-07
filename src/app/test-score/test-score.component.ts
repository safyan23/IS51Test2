import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';

export interface ITest {
  id?: number;
  testName: string;
  pointsPossible: number;
  pointsReceived: number;
  percentage: number;
  grade: string;
}
@Component({
  selector: 'app-test-score',
  templateUrl: './test-score.component.html',
  styleUrls: ['./test-score.component.css']
})
export class TestScoreComponent implements OnInit {

  tests: Array<ITest> = [];
  nameParams = '';
  constructor(
    private http: Http,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    const tests = JSON.parse(localStorage.getItem('tests'));
    if (tests && tests.length > 0) {
      this.tests = tests;
    } else {
      this.tests = await this.loadTestsFromJSON();
    }
    //  console.log('this.tests is from ng0ninit');
  }

  async loadTestsFromJSON() {
    const tests = await this.http.get('assets/tests.json').toPromise();
    return tests.json();
  }

  addTest() {
    const test: ITest = {
      id: null,
      testName: null,
      pointsPossible: null,
      pointsReceived: null,
      percentage: null,
      grade: null
    };
    this.tests.unshift(test);
    localStorage.setItem('tests', JSON.stringify(this.tests));
  }


  saveTest() {
    localStorage.setItem('tests', JSON.stringify(this.tests));
    this.toastService.showToast('success', 3000, 'Success: Items Saved!');
  }

  delete(index: number) {
    this.tests.splice(index, 1);
    localStorage.setItem('tests', JSON.stringify(this.tests));
  }

  calculateGrade() {
    const data = this.math();
    localStorage.setItem('tests', JSON.stringify(data));
    this.router.navigate(['home', data]);
  }

  math() {
    if (this.nameParams == null || this.nameParams === '') {
      this.toastService.showToast('warning', 5000, 'Name must not be null!');
    } else if (this.nameParams.indexOf(', ') === -1) {
      this.toastService.showToast('warning', 5000, 'Name must contain a comma and a space!');
    } else {
      let pointsPossible = 0;
      let pointsReceived = 0;
      let percentage = 0.0;
      for (let i = 0; i < this.tests.length; i++) {
        pointsPossible += this.tests[i].pointsPossible;
        pointsReceived += this.tests[i].pointsReceived;
        percentage += this.tests[i].percentage;
      }
      const totalPercentage = pointsReceived / pointsPossible;
      // totalPercentage = percentage * 100;
      let finalGrade = '';
      if (totalPercentage >= .90) { finalGrade = 'A'; } else
        if (totalPercentage >= .80) { finalGrade = 'B'; } else
          if (totalPercentage >= .70) { finalGrade = 'C'; } else
            if (totalPercentage >= .60) { finalGrade = 'D'; } else { finalGrade = 'F'; }
      return {
        name: this.nameParams,
        totalPointsPossible: pointsPossible,
        totalPointsReceived: pointsReceived,
        totalPercentage: pointsReceived / pointsPossible * 100,
        // .toFixed is a solution to round up that i found on google.
        percent: totalPercentage.toFixed(2),
        finalGrade: finalGrade
      };
    }
  }

}
