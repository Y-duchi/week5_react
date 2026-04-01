import { FunctionComponent } from './core/runtime.js';
import { App } from './app/App.js';
import './styles.css';

const appContainer = document.getElementById('app');
const app = new FunctionComponent(App);

app.mount(appContainer);
