import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  gridOutline,
  cubeOutline,
  locationOutline,
  cashOutline
} from 'ionicons/icons';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Custom Theme Variables & Styles */
import './theme/variables.css';
import './theme/custom.css';

import { InventoryProvider } from './context/InventoryContext';
import { DashboardTab } from './pages/DashboardTab';
import { InventoryTab } from './pages/InventoryTab';
import { BinsTab } from './pages/BinsTab';
import { SalesTab } from './pages/SalesTab';

setupIonicReact({
  mode: 'md' // Material Design look with iOS capabilities
});

export const App: React.FC = () => (
  <IonApp>
    <InventoryProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/dashboard" component={DashboardTab} />
            <Route exact path="/inventory" component={InventoryTab} />
            <Route exact path="/bins" component={BinsTab} />
            <Route exact path="/sales" component={SalesTab} />
            <Route exact path="/">
              <Redirect to="/dashboard" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={gridOutline} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>

            <IonTabButton tab="inventory" href="/inventory">
              <IonIcon icon={cubeOutline} />
              <IonLabel>Inventory</IonLabel>
            </IonTabButton>

            <IonTabButton tab="bins" href="/bins">
              <IonIcon icon={locationOutline} />
              <IonLabel>Storage Bins</IonLabel>
            </IonTabButton>

            <IonTabButton tab="sales" href="/sales">
              <IonIcon icon={cashOutline} />
              <IonLabel>Sales Log</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </InventoryProvider>
  </IonApp>
);

export default App;
