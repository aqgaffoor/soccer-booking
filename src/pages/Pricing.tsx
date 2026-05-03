import { Check } from 'lucide-react';
import './Pricing.css';

const PRICING_PLANS = [
  {
    name: "Standard",
    description: "Entry-level plan for essential features",
    price: "€59.00",
    popular: false,
    features: [
      "Court blocking",
      "Basic chat",
      "Customer database",
      "Basic integrations",
      "Match making"
    ]
  },
  {
    name: "Professional",
    description: "Advanced tools and performance",
    price: "€89.00",
    popular: false,
    features: [
      "Everything in standard",
      "Court information display",
      "User categories",
      "Money wallet",
      "8h response time"
    ]
  },
  {
    name: "Champion",
    description: "Optimal plan for growing your club",
    price: "€139.00",
    popular: true,
    features: [
      "Everything in professional",
      "Coaches management",
      "Training courses",
      "Customer memberships",
      "Priority support"
    ]
  },
  {
    name: "Master",
    description: "Top-tier benefits and priority support",
    price: "€279.00",
    popular: false,
    features: [
      "Everything in champion",
      "Advanced reporting",
      "Custom branding",
      "API access",
      "Dedicated account manager"
    ]
  }
];

export default function Pricing() {
  return (
    <div className="pricing-page container page-wrapper">
      <div className="pricing-header">
        <h1 className="pricing-title">Pricing plans</h1>
        <p className="pricing-subtitle">
          Flexible plans that adapt to <span className="highlight">your club's needs</span>.
        </p>
        
        <div className="billing-toggle">
          <span className="toggle-label active">Monthly</span>
          <div className="toggle-switch">
            <div className="toggle-knob"></div>
          </div>
          <span className="toggle-label">Yearly</span>
        </div>
      </div>

      <div className="pricing-grid">
        {PRICING_PLANS.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
            
            <div className="card-header">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-desc">{plan.description}</p>
            </div>
            
            <div className="plan-price-container">
              <span className="plan-price">{plan.price}</span>
              <span className="plan-period">per month (VAT excl.)</span>
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="feature-item">
                  <div className="check-icon-wrapper">
                    <Check size={14} className="check-icon" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className={`btn w-full mt-auto ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
