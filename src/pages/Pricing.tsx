import { useState } from 'react';
import { Check } from 'lucide-react';
import './Pricing.css';

const PRICING_PLANS = [
  {
    name: "Standard",
    description: "Entry-level plan for essential features",
    monthlyPrice: 999,
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
    monthlyPrice: 1499,
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
    monthlyPrice: 2499,
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
    monthlyPrice: 4999,
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
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="pricing-page container page-wrapper">
      <div className="pricing-header">
        <h1 className="pricing-title">Pricing plans</h1>
        <p className="pricing-subtitle">
          Flexible plans that adapt to <span className="highlight">your club's needs</span>.
        </p>
        
        <div className="billing-toggle" onClick={() => setIsYearly(!isYearly)} style={{ cursor: 'pointer' }}>
          <span className={`toggle-label ${!isYearly ? 'active' : ''}`}>Monthly</span>
          <div className="toggle-switch">
            <div className="toggle-knob" style={{ transform: isYearly ? 'translateX(24px)' : 'translateX(0)' }}></div>
          </div>
          <span className={`toggle-label ${isYearly ? 'active' : ''}`}>Yearly</span>
        </div>
        {isYearly && <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Save 20% with yearly billing!</p>}
      </div>

      <div className="pricing-grid">
        {PRICING_PLANS.map((plan, index) => {
          const finalPrice = isYearly ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
          
          return (
            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
              
              <div className="card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
              </div>
              
              <div className="plan-price-container">
                <span className="plan-price">R {finalPrice}</span>
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
          )
        })}
      </div>
    </div>
  );
}
