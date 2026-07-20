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
  IonCard,
  IonCardContent,
  IonBadge,
  IonButtons
} from '@ionic/react';
import {
  cubeOutline,
  trendingUpOutline,
  walletOutline,
  pieChartOutline,
  addOutline,
  sunnyOutline,
  moonOutline,
  bagCheckOutline,
  locationOutline,
  arrowForwardOutline,
  pricetagOutline
} from 'ionicons/icons';
import { useInventory } from '../context/InventoryContext';
import { ItemModal } from '../components/ItemModal';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { InventoryItem } from '../types/inventory';

export const DashboardTab: React.FC = () => {
  const { stats, items, sales, isDarkMode, toggleDarkMode } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const activeItems = items.filter(i => i.status === 'Active');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>
            <div className="brand-header">
              <span>📦 Petaca</span>
              <span className="brand-badge">eBay Manager v8</span>
            </div>
          </IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={toggleDarkMode} title="Toggle Theme">
              <IonIcon icon={isDarkMode ? sunnyOutline : moonOutline} />
            </IonButton>

            <IonButton
              color="primary"
              fill="solid"
              style={{ borderRadius: '8px', fontWeight: 700 }}
              onClick={() => setIsAddModalOpen(true)}
            >
              <IonIcon slot="start" icon={addOutline} />
              Add Item
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          {/* Welcome Banner */}
          <IonRow className="ion-margin-bottom">
            <IonCol size="12">
              <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '16px',
                padding: '24px',
                color: '#ffffff',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)'
              }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, fontFamily: 'var(--ion-heading-font-family)' }}>
                  eBay Store Inventory Hub 🚀
                </h1>
                <p style={{ color: '#94a3b8', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
                  Track your stock, calculate net profit margins, and streamline storage bin locations.
                </p>
              </div>
            </IonCol>
          </IonRow>

          {/* Metric Cards Grid */}
          <IonRow>
            {/* Metric 1: Total Active Value */}
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <IonIcon icon={cubeOutline} />
                </div>
                <div className="metric-label">Active Listings Value</div>
                <div className="metric-value">${stats.totalActiveListValue.toFixed(2)}</div>
                <div className="metric-sub" style={{ color: '#10b981' }}>
                  <IonIcon icon={trendingUpOutline} /> {stats.activeListingsCount} Active Items
                </div>
              </div>
            </IonCol>

            {/* Metric 2: Capital Invested */}
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <IonIcon icon={walletOutline} />
                </div>
                <div className="metric-label">Total Capital Invested</div>
                <div className="metric-value">${stats.totalInvestedCost.toFixed(2)}</div>
                <div className="metric-sub" style={{ color: 'var(--app-subtext)' }}>
                  Across {stats.totalItems} total items
                </div>
              </div>
            </IonCol>

            {/* Metric 3: Potential Net Profit */}
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <IonIcon icon={trendingUpOutline} />
                </div>
                <div className="metric-label">Est. Potential Profit</div>
                <div className="metric-value" style={{ color: '#10b981' }}>
                  +${stats.potentialProfit.toFixed(2)}
                </div>
                <div className="metric-sub" style={{ color: '#10b981' }}>
                  {stats.averageMarginPct}% Avg Margin
                </div>
              </div>
            </IonCol>

            {/* Metric 4: Realized Profit */}
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <IonIcon icon={pieChartOutline} />
                </div>
                <div className="metric-label">Realized Profit (Sales Log)</div>
                <div className="metric-value" style={{ color: '#a855f7' }}>
                  +${stats.realizedProfitThisMonth.toFixed(2)}
                </div>
                <div className="metric-sub" style={{ color: 'var(--app-subtext)' }}>
                  {stats.soldCount} items sold
                </div>
              </div>
            </IonCol>
          </IonRow>

          {/* Spotlight Active Items & Sales Activity */}
          <IonRow className="ion-margin-top">
            {/* Active Items Spotlight */}
            <IonCol size="12" sizeLg="8">
              <div style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--ion-heading-font-family)' }}>
                    Active Inventory Spotlight
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--app-subtext)' }}>
                    {activeItems.length} items ready to sell
                  </span>
                </div>

                <IonGrid style={{ padding: 0 }}>
                  <IonRow>
                    {activeItems.slice(0, 4).map(item => {
                      const estimatedFee = (item.listPrice * 0.1325) + 0.30;
                      const estimatedNet = item.listPrice - item.purchaseCost - estimatedFee;

                      return (
                        <IonCol size="12" sizeSm="6" key={item.id}>
                          <div
                            className="inventory-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedItem(item)}
                          >
                            <img src={item.imageUrl} alt={item.title} className="inventory-thumb" />
                            <div className="inventory-body">
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <span className="item-sku">{item.sku}</span>
                                  <span className="bin-tag">
                                    <IonIcon icon={locationOutline} /> {item.locationBin}
                                  </span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, height: '2.6em', overflow: 'hidden' }}>
                                  {item.title}
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <div className="price-tag">${item.listPrice.toFixed(2)}</div>
                                <div className="profit-pill">+${estimatedNet.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        </IonCol>
                      );
                    })}
                  </IonRow>
                </IonGrid>
              </div>
            </IonCol>

            {/* Recent Sales Activity Feed */}
            <IonCol size="12" sizeLg="4">
              <div style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)', borderRadius: '16px', padding: '20px', height: '100%' }}>
                <h3 style={{ margin: '0 0 16px 0', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--ion-heading-font-family)' }}>
                  Recent Sales Log
                </h3>

                {sales.length === 0 ? (
                  <p style={{ color: 'var(--app-subtext)', fontSize: '0.85rem' }}>No sales logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sales.slice(0, 4).map(sale => (
                      <div
                        key={sale.id}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--app-card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          flexShrink: 0
                        }}>
                          <IonIcon icon={bagCheckOutline} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sale.itemTitle}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)' }}>
                            Buyer: @{sale.buyerUsername} • {sale.saleDate}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#10b981' }}>
                            +${sale.netProfit.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--app-subtext)' }}>
                            Sale: ${sale.salePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modals */}
        <ItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />

        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={item => setSelectedItem(item)}
        />
      </IonContent>
    </IonPage>
  );
};
