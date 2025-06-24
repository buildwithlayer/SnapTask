import './MenuBar.css';
import logoUrl from './assets/react.svg';

function MenuBar() {
    return (
        <div id={'menu-bar'}>
            <div className={'menu-item'}>
                <img alt={'Logo'} src={logoUrl} />
                <div className={'company-name'}>SnapLinear</div>
            </div>
            <div className={'menu-bar'}>
                How it works
            </div>
        </div>
    );
}

export default MenuBar;