-- Supply Chain Network Analyst Schema
-- PostgreSQL DDL for nodes, lanes, SKUs, demand, inventory, scenarios

CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity_units DECIMAL(15, 2),
  capacity_periodicity VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_node_id UUID NOT NULL REFERENCES nodes(id),
  destination_node_id UUID NOT NULL REFERENCES nodes(id),
  mode VARCHAR(50) NOT NULL,
  transit_time_days INTEGER,
  frequency_per_week INTEGER,
  cost_per_unit DECIMAL(10, 4),
  cost_per_container DECIMAL(12, 2),
  min_order_qty DECIMAL(15, 2),
  capacity_units_per_period DECIMAL(15, 2),
  incoterm VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  unit_cost DECIMAL(10, 4),
  weight_kg DECIMAL(10, 4),
  volume_m3 DECIMAL(10, 6),
  tariff_code VARCHAR(50),
  duty_rate DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES skus(id),
  destination_node_id UUID NOT NULL REFERENCES nodes(id),
  demand_date DATE NOT NULL,
  qty_units DECIMAL(15, 2),
  confidence_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES skus(id),
  node_id UUID NOT NULL REFERENCES nodes(id),
  qty_on_hand DECIMAL(15, 2),
  safety_stock_qty DECIMAL(15, 2),
  reorder_point_qty DECIMAL(15, 2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sku_id, node_id)
);

CREATE TABLE IF NOT EXISTS supplier_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_node_id UUID NOT NULL REFERENCES nodes(id),
  sku_id UUID NOT NULL REFERENCES skus(id),
  lead_time_days INTEGER,
  moq DECIMAL(15, 2),
  is_single_source BOOLEAN,
  disruption_risk_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scenario_type VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenario_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  decision_type VARCHAR(50),
  sku_id UUID REFERENCES skus(id),
  origin_node_id UUID REFERENCES nodes(id),
  destination_node_id UUID REFERENCES nodes(id),
  allocation_qty DECIMAL(15, 2),
  priority INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  kpi_name VARCHAR(100),
  kpi_value DECIMAL(15, 4),
  kpi_unit VARCHAR(50),
  reference_value DECIMAL(15, 4),
  variance DECIMAL(10, 2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_lanes_origin ON lanes(origin_node_id);
CREATE INDEX idx_lanes_destination ON lanes(destination_node_id);
CREATE INDEX idx_demand_sku ON demand(sku_id);
CREATE INDEX idx_demand_date ON demand(demand_date);
CREATE INDEX idx_inventory_node ON inventory(node_id);
CREATE INDEX idx_supplier_skus_supplier ON supplier_skus(supplier_node_id);
CREATE INDEX idx_scenarios_type ON scenarios(scenario_type);
CREATE INDEX idx_kpi_scenario ON kpi_results(scenario_id);
