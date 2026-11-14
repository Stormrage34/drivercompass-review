import type { CSSProperties } from "react";

const h = (n: number, extra?: CSSProperties): CSSProperties =>
  ({ "--h": n, ...extra }) as CSSProperties;

const DemoTag = () => (
  <p className="demo-tag">Demo data — illustrative example</p>
);

const VacancyRow = ({
  lane,
  employer,
  status,
  tone = "",
}: {
  lane: string;
  employer: string;
  status: string;
  tone?: string;
}) => (
  <li className="d-win__row">
    <span>
      <b>{lane}</b>
      <small>{employer}</small>
    </span>
    <span className={`d-chip${tone}`}>{status}</span>
  </li>
);

export default function MarketingHome() {
  return (
    <main id="main-content">
      {/* The hero: the mission, one fact from the template, and the product. */}
      <section className="hero hero--collage" data-enter aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <h1 id="hero-h">Know the employer. Choose your next move.</h1>
              <p className="hero__lead">
                DriverCompass is a pre-launch preview of a driver-first employer transparency
                platform. It puts international C+E vacancies on one structured template so you can
                compare the conditions, see what is missing and contact the employer yourself. No live
                marketplace is open yet.
              </p>
              <div className="btn-row">
                <a className="btn btn--primary" href="#record">
                  See a vacancy record
                </a>
                <a className="btn btn--secondary" href="/how-verification-works">
                  How verification works
                </a>
              </div>
              <p className="hero__proof">
                Pre-launch preview. Driver accounts are free. No employer billing exists.
              </p>
            </div>
            <div
              className="hero__art span-6 start-7"
              data-fx="gradient-mesh"
              data-fx-seed="41"
              role="group"
              aria-label="An illustrative DriverCompass vacancy list with one record open"
            >
              <DemoTag />
              <div className="ly-piece ly-piece--main d-win" aria-hidden="true">
                <div className="d-win__bar">
                  <span className="d-win__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>DriverCompass · Vacancies · illustrative</span>
                </div>
                <div className="d-win__body">
                  <div className="d-side">
                    <span className="is-on">
                      <i />
                      Open
                    </span>
                    <span>
                      <i />
                      Saved
                    </span>
                    <span>
                      <i />
                      Enquiries
                    </span>
                    <span>
                      <i />
                      Reviews
                    </span>
                    <span className="d-side__label">Countries</span>
                    <span>
                      <i />
                      NL
                    </span>
                    <span>
                      <i />
                      DE
                    </span>
                  </div>
                  <div className="d-main">
                    <div className="d-main__head">
                      <h4>Vacancies</h4>
                      <span className="d-btn">Declared roles</span>
                    </div>
                    <div className="d-tabs">
                      <span className="is-on">All</span>
                      <span>Reefer</span>
                      <span>Tank</span>
                    </div>
                    <ul className="d-rows">
                      <VacancyRow
                        lane="C+E reefer, NL–DE–DK"
                        employer="Direct employer · Rotterdam"
                        status="Conditions stated"
                      />
                      <VacancyRow
                        lane="C+E tank, ADR"
                        employer="Direct employer · Bremen"
                        status="Identity checked"
                        tone=" d-chip--ok"
                      />
                      <VacancyRow
                        lane="C+E container, NL"
                        employer="Agency declared · Venlo"
                        status="Agency"
                        tone=" d-chip--warn"
                      />
                      <VacancyRow
                        lane="C+E box, DE–NL"
                        employer="Direct employer · Hamburg"
                        status="Pay not disclosed"
                        tone=" d-chip--warn"
                      />
                      <VacancyRow
                        lane="C+E reefer, NL–FR"
                        employer="Direct employer · Breda"
                        status="Conditions stated"
                      />
                      <VacancyRow
                        lane="C+E tipper, DK"
                        employer="Direct employer · Aarhus"
                        status="Identity checked"
                        tone=" d-chip--ok"
                      />
                    </ul>
                  </div>
                </div>
              </div>
              <div className="ly-piece ly-piece--note d-card" aria-hidden="true" data-ly-steps="700">
                <div className="d-card__row">
                  <h5>The vacancy template</h5>
                  <span className="d-chip">Fixed template</span>
                </div>
                <div className="d-note__line" data-step>
                  <i>✓</i>
                  <span>Same fields, same order, every employer</span>
                </div>
                <div className="d-note__line" data-step>
                  <i className="warn">!</i>
                  <span>Missing answers stay marked &ldquo;Not disclosed&rdquo;</span>
                </div>
                <div className="d-note__line" data-step>
                  <i>✓</i>
                  <span>Conditions dated by the employer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The product, big: the vacancy list beside the open record. */}
      <section className="section" id="record" aria-labelledby="record-h" style={h(1)}>
        <div className="wrap">
          <div className="grid">
            <div className="span-5">
              <h2 id="record-h">Every vacancy uses the same template.</h2>
            </div>
            <div className="span-6 start-7">
              <p className="t-lead">
                A fixed set of fields in a fixed order: pay and allowances, rotation, home time, weekly
                rest, accommodation, loading, vehicle, routes and who signs the contract. A field the
                employer leaves empty is marked &ldquo;Not disclosed&rdquo;, never filled in for them.
              </p>
              <a className="link" href="#know">
                See what the template holds
              </a>
            </div>
          </div>

          <div className="record-shell">
            <DemoTag />
            <p className="record-counts">
              <span>
                Template <b>fixed</b>
              </span>
              <span>
                Key conditions answered <b>12 of 17</b>
              </span>
              <span>
                Evidence on fields <b>none on file</b>
              </span>
            </p>
            <div
              className="ui app fill"
              role="img"
              aria-label="An illustrative vacancy list beside the open vacancy record"
            >
              <div className="app__pane app__pane--list">
                <div className="ui-panel d-win">
                  <div className="d-win__bar">
                    <span className="d-win__dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>DriverCompass · Vacancies · illustrative</span>
                  </div>
                  <ul className="d-win__rows">
                    <VacancyRow
                      lane="C+E reefer, NL–DE–DK"
                      employer="Direct employer · Rotterdam"
                      status="Conditions stated"
                    />
                    <VacancyRow
                      lane="C+E tank, ADR"
                      employer="Direct employer · Bremen"
                      status="Identity checked"
                        tone=" d-chip--ok"
                    />
                    <VacancyRow
                      lane="C+E container, NL"
                      employer="Agency declared · Venlo"
                      status="Agency"
                      tone=" d-chip--warn"
                    />
                    <VacancyRow
                      lane="C+E box, DE–NL"
                      employer="Direct employer · Hamburg"
                      status="Pay not disclosed"
                      tone=" d-chip--warn"
                    />
                    <VacancyRow
                      lane="C+E reefer, NL–FR"
                      employer="Direct employer · Breda"
                      status="Conditions stated"
                    />
                    <VacancyRow
                      lane="C+E tipper, DK"
                      employer="Direct employer · Aarhus"
                      status="Identity checked"
                        tone=" d-chip--ok"
                    />
                    <VacancyRow
                      lane="C+E ADR tank container"
                      employer="Direct employer · Antwerp"
                      status="Conditions stated"
                    />
                    <VacancyRow
                      lane="C+E tramping, NL–BE"
                      employer="Agency declared · Tilburg"
                      status="Agency"
                      tone=" d-chip--warn"
                    />
                    <VacancyRow
                      lane="C+E reefer, NL–SE"
                      employer="Direct employer · Gothenburg"
                      status="Conditions stated"
                    />
                    <VacancyRow
                      lane="C+E box, PL–DE"
                      employer="Direct employer · Poznań"
                      status="Identity checked"
                        tone=" d-chip--ok"
                    />
                  </ul>
                </div>
              </div>
              <div className="app__pane app__pane--open">
                <div className="ui-panel rec">
                  <div className="rec__head">
                    <h4>C+E reefer, NL–DE–DK</h4>
                    <span className="d-chip">Conditions employer-stated</span>
                    <span className="rec__meta">Rotterdam · illustrative · excerpt of the record</span>
                  </div>
                  <dl className="rec__grid">
                    <div className="rec__row">
                      <dt>Gross pay</dt>
                      <dd>€2,950 / month</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Allowances</dt>
                      <dd>Night work, per CAO</dd>
                    </div>
                    <div className="rec__row rec__row--missing">
                      <dt>Reimbursements</dt>
                      <dd>Not disclosed</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Rotation</dt>
                      <dd>3 weeks out, 1 home</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Home time</dt>
                      <dd>7 days per rotation</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Weekly rest</dt>
                      <dd>Hotel at depot</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Accommodation</dt>
                      <dd>Free, single room</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Loading</dt>
                      <dd>Occasional</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Truck</dt>
                      <dd>Volvo FH 2022</dd>
                    </div>
                    <div className="rec__row">
                      <dt>Contracting entity</dt>
                      <dd>Direct employer, declared</dd>
                    </div>
                  </dl>
                  <p className="rec__note">
                    Every value is employer-declared unless the record names a check. Identity is
                    checked by DriverCompass; the conditions are not inspected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 1: know the employer. */}
      <section className="section" id="know" aria-labelledby="know-h" style={h(1)}>
        <div className="wrap">
          <div className="section-head">
            <h2 id="know-h">
              Don&rsquo;t just read the job offer. <span className="muted">Hear from the drivers.</span>
            </h2>
          </div>
          <div className="grid cards-3">
            <article className="card card--row span-4">
              <h3>Promise versus reality</h3>
              <p>
                An advert says &ldquo;up to €3,200&rdquo;. The record states gross pay, the allowances
                separately, and the date the employer confirmed it.
              </p>
              <div className="panel demo-frame">
                <DemoTag />
                <div className="mini" role="img" aria-label="An illustrative advert claim beside the structured record that answers it">
                  <p className="mini__head">
                    Vacancy record <span>illustrative</span>
                  </p>
                  <ul className="mini__rows">
                    <li>
                      <span>Advert said</span>
                      <b>up to €3,200</b>
                    </li>
                    <li>
                      <span>Record states</span>
                      <b>€2,950 gross / month</b>
                    </li>
                    <li>
                      <span>Allowances</span>
                      <b>night work, separate</b>
                    </li>
                    <li className="is-missing">
                      <span>Reimbursements</span>
                      <b>Not disclosed</b>
                    </li>
                    <li>
                      <span>Conditions confirmed</span>
                      <b>12 Nov, by the employer</b>
                    </li>
                  </ul>
                  <p className="mini__foot">Employer-stated, not inspected</p>
                </div>
              </div>
            </article>

            <article className="card card--row span-4">
              <h3>Reviews are planned, not open</h3>
              <p>
                Public review publication needs legal approval and a staffed moderation process. This
                build does not accept or publish reviews.
              </p>
              <div className="panel demo-frame">
                <DemoTag />
                <div className="mini" role="img" aria-label="An illustrative review status panel showing the feature as planned">
                  <p className="mini__head">
                    Review status <span>illustrative</span>
                  </p>
                  <ul className="mini__rows">
                    <li>
                      <span>Submission</span>
                      <b>Closed</b>
                    </li>
                    <li>
                      <span>Publication</span>
                      <b>Not approved</b>
                    </li>
                    <li>
                      <span>Moderation</span>
                      <b>Designed, not staffed</b>
                    </li>
                    <li>
                      <span>Data collected</span>
                      <b>None</b>
                    </li>
                  </ul>
                  <p className="mini__foot">No review data is collected</p>
                </div>
              </div>
            </article>

            <article className="card card--row span-4">
              <h3>Agencies declare their role</h3>
              <p>
                Every company states whether it is a direct employer, agency, subcontractor or
                intermediary. The role is declared by the company and shown next to the contracting
                entity; it is not independently verified in this preview.
              </p>
              <div className="panel demo-frame">
                <DemoTag />
                <div className="mini" role="img" aria-label="An illustrative recruitment-role record">
                  <p className="mini__head">
                    Recruitment role <span>illustrative</span>
                  </p>
                  <ul className="mini__rows">
                    <li className="is-checked">
                      <span>Direct employer</span>
                      <b>Declared</b>
                    </li>
                    <li>
                      <span>Agency</span>
                      <b>Declared</b>
                    </li>
                    <li>
                      <span>Subcontractor</span>
                      <b>Declared</b>
                    </li>
                    <li>
                      <span>Intermediary</span>
                      <b>Declared</b>
                    </li>
                  </ul>
                  <p className="mini__foot">Declared, not independently verified</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Pillar 2: show your value. */}
      <section className="section" id="passport" aria-labelledby="passport-h" style={h(1)}>
        <div className="wrap">
          <div className="grid passport-grid">
            <div className="span-6">
              <h2 id="passport-h">Your experience has value. Make it visible.</h2>
              <p className="t-lead">
                One driver-controlled profile for licences, qualifications, the transport work you
                have done, the countries you know and the languages you speak.
              </p>
              <ol className="levels">
                <li>
                  <span className="levels__num">1</span>
                  <div>
                    <h3>Self-declared · in this preview</h3>
                    <p>
                      What you enter today: licence, Code 95, ADR classes, experience, countries and languages.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="levels__num">2</span>
                  <div>
                    <h3>Document check · planned</h3>
                    <p>Planned: licence, Code 95 and ADR documents checked against the profile.</p>
                  </div>
                </li>
                <li>
                  <span className="levels__num">3</span>
                  <div>
                    <h3>Corroboration · planned</h3>
                    <p>Planned: a reference or employment confirmation from a past employer.</p>
                  </div>
                </li>
              </ol>
              <p className="t-small muted">
                The profile fields exist in this preview. Document checks and corroboration are planned;
                nothing here claims they are active.
              </p>
            </div>
            <div className="span-5 start-8">
              <div className="passport demo-frame">
                <DemoTag />
                <div className="passport__head">
                  <p className="passport__title">Driver profile</p>
                  <span className="d-chip">Private by default</span>
                </div>
                <p className="passport__meta">Driver profile · illustrative example, not a real driver</p>
                <dl className="passport__rows">
                  <div>
                    <dt>Licence</dt>
                    <dd>C+E · Code 95</dd>
                  </div>
                  <div>
                    <dt>ADR</dt>
                    <dd>Basic + Tanker</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>8 years · reefer, tanker, container</dd>
                  </div>
                  <div>
                    <dt>Preferred countries</dt>
                    <dd>NL · DE · DK</dd>
                  </div>
                  <div>
                    <dt>Languages</dt>
                    <dd>English C2 · Bulgarian native · German A2</dd>
                  </div>
                </dl>
                <div className="passport__levels">
                  <span className="level-chip level-chip--live">Self-declared · preview</span>
                  <span className="level-chip level-chip--planned">Document check · planned</span>
                  <span className="level-chip level-chip--planned">Corroboration · planned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 3: choose directly. */}
      <section className="section" id="direct" aria-labelledby="direct-h" style={h(1)}>
        <div className="wrap">
          <div className="grid direct-grid">
            <div className="span-6">
              <h2 id="direct-h">Connect directly. Keep control.</h2>
              <p className="t-lead">
                Discover transport employers, compare opportunities and decide who can see your
                profile and contact you.
              </p>
              <ul className="direct-points">
                <li>
                  <h3>Private by default</h3>
                  <p>Your profile is not searchable. Employers cannot browse or search drivers.</p>
                </li>
                <li>
                  <h3>Shared per enquiry</h3>
                  <p>You choose whether to share your email and phone with each employer you contact.</p>
                </li>
                <li>
                  <h3>No placement fee</h3>
                  <p>Drivers pay nothing, and no commission is taken from your pay.</p>
                </li>
              </ul>
            </div>
            <div className="span-5 start-8">
              <div className="privacy-card">
                <div className="privacy-card__head">
                  <p className="passport__title">Driver privacy settings</p>
                  <span className="d-chip d-chip--ok">Private by default</span>
                </div>
                <ul className="privacy-rows">
                  <li>
                    <span>Profile visibility</span>
                    <b>Private</b>
                  </li>
                  <li>
                    <span>Employer search</span>
                    <b>Off</b>
                  </li>
                  <li>
                    <span>Contact sharing</span>
                    <b>Per enquiry you send</b>
                  </li>
                  <li>
                    <span>Current employer shown</span>
                    <b>Never</b>
                  </li>
                </ul>
                <a className="link" href="/register?role=driver">
                  Create a driver profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How verification works, on the inverse ground. */}
      <section
        className="section ground-inverse"
        id="verification"
        aria-labelledby="verification-h"
        data-moment="iris-opens"
        data-moment-opts='{"from": "base"}'
        style={h(1)}
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="verification-h">
              How verification works.{" "}
              <span className="muted">Three records, three different things.</span>
            </h2>
            <p>
              Each record is shown separately, so a checked identity never reads as a checked
              vacancy, and a planned review is never shown as published.
            </p>
          </div>
          <div className="verify">
            <div className="verify__step">
              <p className="verify__num">01</p>
              <h3>Company identity can be checked</h3>
              <p>
                Legal name, registration number and recruitment role can be checked by a moderator
                against registry evidence and recorded on the company profile. No company is verified in
                this preview.
              </p>
            </div>
            <div className="verify__step">
              <p className="verify__num">02</p>
              <h3>Vacancy conditions employer-confirmed</h3>
              <p>
                Pay, rotation and accommodation confirmed by the employer and dated on the vacancy. It
                is their statement, not an inspection.
              </p>
            </div>
            <div className="verify__step">
              <p className="verify__num">03</p>
              <h3>Reviews are planned, not open</h3>
              <p>
                Review publication requires legal approval and staffing. This build does not accept,
                moderate or publish reviews.
              </p>
            </div>
          </div>
          <dl className="verify__log">
            <div>
              <dt>Company identity</dt>
              <dd>Checked against the register when a moderator completes it</dd>
            </div>
            <div>
              <dt>Vacancy conditions</dt>
              <dd>Employer-confirmed and dated. Automatic reconfirmation is designed but not running.</dd>
            </div>
            <div>
              <dt>Driver review</dt>
              <dd>Planned, not open. No review data is collected.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Driver reviews: planned, not open. */}
      <section className="section" id="voices" aria-labelledby="voices-h" style={h(1)}>
        <div className="wrap">
          <div className="section-head">
            <h2 id="voices-h">Driver reviews are planned, not open.</h2>
            <p>
              Public review publication needs legal approval and a staffed moderation process. This
              preview does not accept or publish reviews, and no review data is collected.
            </p>
          </div>
          <div className="voice-card">
            <div className="voice-card__head">
              <h3>What reviews will look like</h3>
              <span className="d-chip d-chip--warn">Planned</span>
            </div>
            <ul className="voices-rules">
              <li>Employment period and role stated by the reviewer.</li>
              <li>Moderation for eligibility, personal data and legal risk before publication.</li>
              <li>The employer&rsquo;s right of reply, never a right of deletion.</li>
              <li>No paid placement, no paid removal, no bought rating.</li>
            </ul>
            <a className="link" href="/review-policy">
              Read the planned review policy
            </a>
          </div>
        </div>
      </section>

      {/* Employers. */}
      <section className="section" id="employers" aria-labelledby="employers-h" style={h(1)}>
        <div className="wrap">
          <div className="section-head">
            <h2 id="employers-h">For employers: show the conditions drivers need.</h2>
            <p>
              This preview shows how a company profile and structured vacancies will present your
              conditions. Employer accounts exist in the build, but no onboarding, publication or billing
              is open.
            </p>
          </div>
          <div className="grid employer-grid">
            <div className="span-3">
              <h3>Structured company profile</h3>
              <p>Legal identity, recruitment role and the entity that signs the contract.</p>
            </div>
            <div className="span-3">
              <h3>Transparent vacancies</h3>
              <p>Every vacancy follows the same template, with missing answers marked.</p>
            </div>
            <div className="span-3">
              <h3>Direct enquiries</h3>
              <p>Drivers contact you themselves; there is no agency between you.</p>
            </div>
            <div className="span-3">
              <h3>Show your standards</h3>
              <p>A declared company identity, with verification available through moderation, and no paid ranking.</p>
            </div>
          </div>
          <div className="employer-promise">
            <p>
              <strong>Payment cannot buy reviews, verification or reputation.</strong> No subscription,
              paid listing, ranking or removal exists.
            </p>
            <p className="t-small">
              No payment is taken. Employer billing is not implemented, and no employer is onboarded in
              this preview.
            </p>
            <div className="btn-row">
              <a className="btn btn--primary" href="/for-employers">
                How employer accounts work
              </a>
              <a className="btn btn--secondary" href="#record">
                See the vacancy template
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Questions, every answer open. */}
      <section className="section" id="questions" aria-labelledby="questions-h" style={h(1)}>
        <div className="wrap">
          <div className="section-head">
            <h2 id="questions-h">Questions drivers ask</h2>
          </div>
          <div className="faq">
            <div className="faq__item">
              <h3>Is DriverCompass a recruitment agency?</h3>
              <p>
                No. We publish employer-declared conditions and carry the enquiry. Reviews are planned,
                not open, and the employment discussion happens directly between driver and employer.
              </p>
            </div>
            <div className="faq__item">
              <h3>What does it cost a driver?</h3>
              <p>
                Nothing. Reading records and contacting employers through the platform are free. There is
                no employer billing yet.
              </p>
            </div>
            <div className="faq__item">
              <h3>What does &ldquo;identity checked&rdquo; mean?</h3>
              <p>
                That a moderator has checked the company&rsquo;s legal name, registration number and
                recruitment role, when the record says so. No company is verified in this preview. It
                does not mean the pay or the conditions were inspected.
              </p>
            </div>
            <div className="faq__item">
              <h3>Can an employer pay for better reviews?</h3>
              <p>
                No. No subscription or paid listing exists. Nothing can move a review, score,
                verification or ranking, and no paid listing is marked verified.
              </p>
            </div>
            <div className="faq__item">
              <h3>What happens if a field is missing?</h3>
              <p>
                It is shown as &ldquo;Not disclosed&rdquo;. Missing information is never filled in by
                the platform and never counted as a positive.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
