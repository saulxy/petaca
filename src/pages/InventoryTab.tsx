import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonItem
} from '@ionic/react';
import {
  addOutline,
  locationOutline,
  gridOutline,
  listOutline,
  filterOutline,
  pricetagOutline,
  cubeOutline
} from 'ionicons/icons';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, ListingStatus } from '../types/inventory';
import { ItemModal } from '../components/ItemModal';
import { ItemDetailModal } from '../components/ItemDetailModal';

export const InventoryTab: React.FC = () => {
  const { items, bins, searchQuery, setSearchQuery } = useInventory();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [binFilter, setBinFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filtered Inventory items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search query match
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.locationBin.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      // Status filter
      const matchesStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();

      // Category filter
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

      // Bin filter
      const matchesBin = binFilter === 'All' || item.locationBin === binFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesBin;
    });
  }, [items, searchQuery, statusFilter, categoryFilter, binFilter]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Inventory Catalog</IonTitle>
          <IonButton
            slot="end"
            color="primary"
            fill="solid"
            style={{ marginRight: '16px' }}
            onClick={() => {
              setItemToEdit(null);
              setIsAddModalOpen(true);
            }}
          >
            <IonIcon slot="start" icon={addOutline} />
            Add Item
          </IonButton>
        </IonToolbar>

        {/* Filter & Search Bar Toolbar */}
        <IonToolbar color="dark">
          <div style={{ padding: '0 8px' }}>
            <IonSearchbar
              value={searchQuery}
              onIonInput={e => setSearchQuery(e.detail.value || '')}
              placeholder="Search by SKU, title, bin or serial #..."
              animated
            />
          </div>
        </IonToolbar>

        {/* Segment Filter for Listing Status */}
        <IonToolbar color="dark">
          <IonSegment
            value={statusFilter}
            onIonChange={e => setStatusFilter(e.detail.value as string)}
            scrollable
          >
            <IonSegmentButton value="All">
              <IonLabel>All ({items.length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Active">
              <IonLabel>Active ({items.filter(i => i.status === 'Active').length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Draft">
              <IonLabel>Drafts ({items.filter(i => i.status === 'Draft').length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Sold">
              <IonLabel>Sold ({items.filter(i => i.status === 'Sold').length})</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Controls Row: Category/Bin filters & View Toggle */}
        <IonGrid style={{ padding: '0 0 16px 0' }}>
          <IonRow className="ion-align-items-center">
            <IonCol size="6" sizeMd="4">
              <IonItem style={{ borderRadius: '8px' }}>
                <IonLabel position="stacked">Filter by Storage Bin</IonLabel>
                <IonSelect value={binFilter} onIonChange={e => setBinFilter(e.detail.value)}>
                  <IonSelectOption value="All">All Storage Bins</IonSelectOption>
                  {bins.map(bin => (
                    <IonSelectOption key={bin.id} value={bin.name}>{bin.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>

            <IonCol size="6" sizeMd="4">
              <IonItem style={{ borderRadius: '8px' }}>
                <IonLabel position="stacked">Filter by Category</IonLabel>
                <IonSelect value={categoryFilter} onIonChange={e => setCategoryFilter(e.detail.value)}>
                  <IonSelectOption value="All">All Categories</IonSelectOption>
                  <IonSelectOption value="Electronics">Electronics</IonSelectOption>
                  <IonSelectOption value="Video Games & Consoles">Video Games & Consoles</IonSelectOption>
                  <IonSelectOption value="Collectibles">Collectibles</IonSelectOption>
                  <IonSelectOption value="Clothing & Sneakers">Clothing & Sneakers</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>

            <IonCol size="12" sizeMd="4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <IonButton
                fill={viewMode === 'grid' ? 'solid' : 'outline'}
                color="primary"
                onClick={() => setViewMode('grid')}
              >
                <IonIcon icon={gridOutline} />
              </IonButton>

              <IonButton
                fill={viewMode === 'list' ? 'solid' : 'outline'}
                color="primary"
                onClick={() => setViewMode('list')}
              >
                <IonIcon icon={listOutline} />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--app-card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--app-card-border)'
          }}>
            <IonIcon icon={cubeOutline} style={{ fontSize: '3rem', color: 'var(--app-subtext)', marginBottom: '12px' }} />
            <h3 style={{ margin: 0, fontWeight: 700 }}>No items match your search filters</h3>
            <p style={{ color: 'var(--app-subtext)', margin: '8px 0 16px 0' }}>Try adjusting your search query or status filters.</p>
            <IonButton color="primary" onClick={() => { setSearchQuery(''); setStatusFilter('All'); setBinFilter('All'); setCategoryFilter('All'); }}>
              Reset Filters
            </IonButton>
          </div>
        ) : (
          /* Grid View vs List View */
          viewMode === 'grid' ? (
            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                {filteredItems.map(item => {
                  const estimatedFee = (item.listPrice * 0.1325) + 0.30;
                  const estimatedNet = item.listPrice - item.purchaseCost - estimatedFee;

                  return (
                    <IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={item.id}>
                      <div
                        className="inventory-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <img src={item.imageUrl} alt={item.title} className="inventory-thumb" />
                        <div className="inventory-body">
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                              <span className="bin-tag"><IonIcon icon={locationOutline} /> {item.locationBin}</span>
                            </div>

                            <div className="item-sku" style={{ marginBottom: '6px', display: 'inline-block' }}>{item.sku}</div>

                            <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, height: '2.6em', overflow: 'hidden', color: 'var(--ion-text-color)' }}>
                              {item.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--app-subtext)' }}>Cost: ${item.purchaseCost.toFixed(2)}</div>
                              <div className="price-tag">${item.listPrice.toFixed(2)}</div>
                            </div>
                            <div className="profit-pill">+${estimatedNet.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>
          ) : (
            /* Compact List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredItems.map(item => {
                const estimatedFee = (item.listPrice * 0.1325) + 0.30;
                const estimatedNet = item.listPrice - item.purchaseCost - estimatedFee;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: 'var(--app-card-bg)',
                      border: '1px solid var(--app-card-border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                        <span className="item-sku">{item.sku}</span>
                        <span className="bin-tag">{item.locationBin}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ion-text-color)' }}>
                        ${item.listPrice.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                        +${estimatedNet.toFixed(2)} profit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Floating Action Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={() => { setItemToEdit(null); setIsAddModalOpen(true); }}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Modals */}
        <ItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          itemToEdit={itemToEdit}
        />

        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={item => {
            setItemToEdit(item);
            setIsAddModalOpen(true);
          }}
        />
      </IonContent>
    </IonPage>
  );
};
