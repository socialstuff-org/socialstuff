import { Component, OnInit } from '@angular/core';

declare let particlesJS: any;

@Component({
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.scss']
})
export class ParticlesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    particlesJS.load('particles-js', '../assets/particles.json', function() {
      console.log('callback - particles.js config loaded');
    });
  }

}
