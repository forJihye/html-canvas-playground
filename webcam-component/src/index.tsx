import './style.css';
import ReactDOM from 'react-dom';
import assetsLoaded from './assets/save';
import assets from './assets';
import store from './store';
import { useRender, send } from './store/hook';
import { pages, START_PAGE } from './pages';

const App = () => {
  const state = useRender();
  const components = Object.entries(pages);
  const currentPage = state.path;

  return <>{
    components.filter(([name]) => name.toLowerCase() === currentPage.toLowerCase())
      .map(([name, Component]) => <Component key={name} pageProps={{assets, store, state, send}} />)
  }</>  
}


const main = async () => { try {
  await assetsLoaded();
  
  store.initPath(START_PAGE.toLowerCase());
  store.savePages(Object.keys(pages).map(page => page.toLowerCase()));
  
  const app = document.getElementById('app') as HTMLDivElement;
  app.style.width = env.SCREEN_WIDTH + 'px';
  app.style.height = env.SCREEN_HEIGHT + 'px';
  ReactDOM.render(<App />, app);

} catch(err: any) {
  throw Error(err)
}}
main();