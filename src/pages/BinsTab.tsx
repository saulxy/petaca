import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonButtons,
  IonBadge
} from '@ionic/react';
import {
  locationOutline,
  addOutline,
  cubeOutline,
  closeOutline,
  saveOutline,
  cashOutline,
  layersOutline
} from 'ionicons/icons';
import { useInventory } from '../context/InventoryContext';

export const BinsTab: React.FC = () => {
  const { bins, items, addBin, setSelectedBin } = useInventory();
  const [isAddBinOpen, setIsAddBinOpen] = useState(false);
  const [binName, setBinName] = useState('');
  const [binLocation, setBinLocation] = useState('');
  const [binDesc, setBinDesc] = useState('');

  const handleCreateBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!binName.trim()) return;

    addBin({
      name: binName.trim(),
      location: binLocation.trim() || 'Unassigned Rack',
      description: binDesc.trim() || 'Storage unit'
    });

    setBinName('');
    setBinLocation('');
    setBinDesc('');
    setIsAddBinOpen(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Storage Bins & Locations</IonTitle>
          <IonButton
            slot="end"
            color="primary"
            fill="solid"
            style={{ marginRight: '16px' }}
            onClick={() => setIsAddBinOpen(true)}
          >
            <IonIcon slot="start" icon={addOutline} />
            New Storage Bin
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-margin-bottom">
            <IonCol size="12">
              <div style={{
                background: 'var(--app-card-bg)',
                border: '1px solid var(--app-card-border)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--ion-heading-font-family)' }}>
                    Physical Storage Bin Organizer
                  </h2>
                  <p style={{ color: 'var(--app-subtext)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                    Quickly locate items when packing eBay orders. Keep track of inventory capacity per rack or bin.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ion-text-color)' }}>{bins.length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Active Bins</div>
                  </div>
                </div>
              </div>
            </IonCol>
          </IonRow>

          {/* Bins Cards Grid */}
          <IonRow>
            {bins.map(bin => {
              const binItems = items.filter(i => i.locationBin === bin.name);
              const binValue = binItems.reduce((acc, curr) => acc + (curr.listPrice * curr.quantity), 0);
              const binCost = binItems.reduce((acc, curr) => acc + (curr.purchaseCost * curr.quantity), 0);

              return (
                <IonCol size="12" sizeSm="6" sizeLg="4" key={bin.id}>
                  <div className="metric-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', margin: 0 }}>
                          <IonIcon icon={locationOutline} />
                        </div>
                        <span className="bin-tag" style={{ fontSize: '0.85rem' }}>
                          {binItems.length} {binItems.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>

                      <h3 style={{ margin: '8px 0 2px 0', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--ion-heading-font-family)' }}>
                        {bin.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ion-color-primary)', marginBottom: '8px' }}>
                        📍 {bin.location}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--app-subtext)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                        {bin.description}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--app-card-border)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Bin Listed Value</div>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>${binValue.toFixed(2)}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Capital Cost</div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>${binCost.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Items list preview inside bin */}
                      {binItems.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)', marginBottom: '8px' }}>
                          Includes: {binItems.slice(0, 2).map(i => i.title).join(', ')} {binItems.length > 2 ? `+${binItems.length - 2} more` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>

        {/* Add Bin Modal */}
        <IonModal isOpen={isAddBinOpen} onDidDismiss={() => setIsAddBinOpen(false)}>
          <IonHeader>
            <IonToolbar color="dark">
              <IonTitle>Add Storage Bin</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsAddBinOpen(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <form onSubmit={handleCreateBin}>
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="stacked">Bin / Shelf Identifier *</IonLabel>
                      <IonInput
                        value={binName}
                        onIonInput={e => setBinName(e.detail.value || '')}
                        placeholder="e.g. Bin D1 or Shelf 3-B"
                        required
                      />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12">
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="stacked">Physical Location</IonLabel>
                      <IonInput
                        value={binLocation}
                        onIonInput={e => setBinLocation(e.detail.value || '')}
                        placeholder="e.g. Garage South Rack, Shelf 2"
                      />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12">
                    <IonItem className="ion-margin-bottom">
                      <IonLabel position="stacked">Description / Item Types</IonLabel>
                      <IonInput
                        value={binDesc}
                        onIonInput={e => setBinDesc(e.detail.value || '')}
                        placeholder="e.g. Medium USPS priority boxes, camera gear"
                      />
                    </IonItem>
                  </IonCol>

                  <IonCol size="6">
                    <IonButton expand="block" fill="outline" onClick={() => setIsAddBinOpen(false)}>
                      Cancel
                    </IonButton>
                  </IonCol>

                  <IonCol size="6">
                    <IonButton expand="block" color="primary" type="submit">
                      <IonIcon slot="start" icon={saveOutline} />
                      Create Bin
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
