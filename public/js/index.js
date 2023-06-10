/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';

// DOM
const mapBox = document.querySelector('#map');
const loginForm = document.querySelector('.form');
const logoutButton = document.querySelector('.nav__el--logout');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

logoutButton?.addEventListener('click', logout);
