# SMISHA seminar deck: slide-by-slide content

Source: `Seminar_ppt.pptx` (24 slides). This file is the content reference for building the interactive website: one section per slide, one web scene per slide unless noted.

## How to read this file

Each slide section has:

- **Source**: whether the text was editable in the PPT or baked into an image. Most slides are single flattened images; their text was transcribed from the rendered slide.
- **Text on slide**: the words exactly as they appear, including the deck's own spelling. Do not change figures. Fix obvious typos only in the final web copy.
- **Visuals**: what the slide shows besides text.
- **Web scene notes**: what the matching web scene should contain and how it should be interactive.

Brand, used on every slide: **SMISHA Share Market Classes**, tagline **"Learn. Analyse. Grow."**, logo is a gold bull over rising bar-chart columns. Palette: deep navy background, gold `#FFB800`, green up-candles, red down-candles.

Global rules for the website:

- Every chart is drawn live from data (candles, bars, tables), never a screenshot.
- Price data on pattern slides is illustrative; label it so.
- Footer disclaimer on every scene: "For learning only. Investments in securities markets are subject to market risks."

---

## Slide 1: Title

**Source:** editable text plus logo image.

**Text on slide:**
- SMISHA SHARE MARKET CLASSES
- LEARN | ANALYZE | GROW
- Empowering Individuals with the Knowledge to Understand Financial Markets.
- Learn Smart Strategies, Master Market Analysis & Build Trading Discipline.
- Your Journey Towards Smarter Trading Starts Here!
- Logo text: SMISHA, SHARE MARKET CLASSES, Learn. Analyse. Grow.

**Visuals:** large gold SMISHA bull logo on navy, faint candlestick chart in the background.

**Web scene notes:** hero. Logo, headline built from "Your Journey Towards Smarter Trading Starts Here", one supporting line from the two "Empowering / Learn Smart Strategies" lines, a "Start the tour" button. Background: live 3D candlestick field. (Built as scene 01.)

---

## Slide 2: Warren Buffett quote

**Source:** single image.

**Text on slide:**
- "The stock market is a device for transferring money from the impatient to the patient."
- Warren Buffett

**Visuals:** sepia photo of Warren Buffett on the right, quote in a serif face on the left.

**Web scene notes:** quote as large typography. Interactive idea: a simple comparison on one price path, a patient holder vs an impatient trader who buys and sells on every swing, showing the patient one ends with more. Keep the attribution. Use a licensed photo or no photo.

---

## Slide 3: Share Market: The Reality Check

**Source:** single image.

**Text on slide:**
- SHARE MARKET: THE REALITY CHECK
- Donut chart centre: Facts Of Share Market
- Donut segments: 95% Loss, 5%, 5%, 1.5%
- Stat rows:
  - 13% Investor, Indian Population
  - 5% Mutual Fund
  - 95% Loss
  - 5% Earn Money

**Visuals:** red/yellow/green/blue donut on the left, four stat rows with icons (people, coins, falling bars, rising bars), illustrated businesswoman holding a phone and cash on the right.

**Web scene notes:** the donut segments add up to more than 100% (95 + 5 + 5 + 1.5), so do not draw them as one donut. Show four separate animated stat counters instead. Optional interaction: "Guess first" — the viewer guesses each percentage before it is revealed. No sources are given for these figures; keep the wording as the trainer's claim or add a source.

---

## Slide 4: India's Stock Market: Regulators & Exchanges

**Source:** single image.

**Text on slide:**
- INDIA'S STOCK MARKET REGULATORS & EXCHANGES
- SEBI: SEBI – Securities and Exchange Board of India. Established in 1988; statutory powers in 1992
- BSE: Bombay Stock Exchange
  - Established: 1875
  - Benchmark Index: SENSEX 30
  - More than 6,000 listed companies (currently, approximate)
- NSE: National Stock Exchange
  - Established: 1992
  - Benchmark Index: NIFTY 50
  - More than 2,629 listed companies (currently, approximate)

**Visuals:** Indian flag and Parliament, SEBI banner, BSE tower and NSE building photos, gold frame.

**Web scene notes:** SEBI as the regulator above two exchange cards (BSE, NSE). Interaction: a timeline 1875 → 1988 → 1992 that lights up each body; flip cards for each exchange with established year, index, listed companies.

---

## Slide 5: Primary vs Secondary Market

**Source:** title text editable, cards are images.

**Text on slide:**
- Difference Between The Primary VS Secondary Market
- Primary Market: Buying and selling between the Company and investor. Labels: COMPANY, FUNDS, IPO, INVESTORS. Instruments: IPO, Bonds, Debentures
- Secondary Market: Buying and selling between the only buyer and seller. Labels: BUY, SELL. Instrument: Shares
- VS

**Visuals:** gold card (company building, investors, IPO document, money arrow), green card (two hands, buy/sell arrows), gold "VS" between them.

**Web scene notes:** toggle between Primary and Secondary. Primary: animated flow of money from investors to the company and shares back (IPO, bonds, debentures). Secondary: shares and money swapping between a buyer and a seller, with the company not involved.

---

## Slide 6: Cash (Equity) Segment

**Source:** single image.

**Text on slide:**
- Cash (Equity) Segment
- Table headers: Time Frame | BUY | SELL
- Intraday (9:15 – 3:15) | Allowed | Allowed
- Delivery (Holding) | Allowed | Not Allowed

**Visuals:** gold bull, clock icon, rising-bars icon, green ticks and a red cross.

**Web scene notes:** a 2×2 grid where clicking each cell explains why. Key point for "Delivery / Sell: Not Allowed": you cannot sell (short) shares in delivery that you do not already hold; short selling is intraday only. Note the window 9:15 to 3:15 is the deck's intraday window (market closes 3:30).

---

## Slide 7: Buy and Sell reversal candles

**Source:** editable text plus drawn candle shapes.

**Text on slide:**
- Buy
- Sell

**Visuals:** left half: a falling arrow into a big red candle followed by a small green candle (labelled Buy). Right half: a rising arrow into a big green candle followed by a small red candle (labelled Sell). A vertical line splits the two.

**Web scene notes:** animate a downtrend that ends with the red-then-green reversal (buy signal), then an uptrend ending with green-then-red (sell signal). Explain that the signal is the reversal candle after a trend.

---

## Slide 8: 2B (2 Bottom)

**Source:** editable text plus a line drawing.

**Text on slide:**
- 2B (2 Bottom)
- Price levels: 220, 210, 200, 195
- Buy (at the 210 line)
- SL 195

**Visuals:** zig-zag line: 220 down to 200, up to 210, down to 195 (marked SL), then up through 210 where a horizontal line is labelled Buy.

**Web scene notes:** built as scene 02. Candles play 220 → 200 → 210 → 195 → break above 210. Buy above 210, stop-loss 195. Trade ticket shows entry, SL, target and risk:reward; the viewer drags SL and target.

---

## Slide 9: 2T (Double Top)

**Source:** editable text plus a line drawing.

**Text on slide:**
- 2T (Double Top)
- Price levels: 210, 205, 212
- SL (above 212)
- Short Sell (at the 205 line)

**Visuals:** line rises to 210, dips to 205, rises to 212 (SL marked above it), then falls through 205 where a horizontal line is labelled Short Sell.

**Web scene notes:** the mirror of scene 02. Candles rise to 210, dip to 205, make a higher top at 212 that fails, then break below 205. Short sell below 205, stop-loss above 212. Same trade ticket and draggable SL/target.

---

## Slide 10: Candle setups with entries and stop-losses

**Source:** drawn candle shapes with editable labels.

**Text on slide:**
- Buy (twice)
- Sell (twice)
- Sl (four times: the deck's abbreviation for stop-loss)

**Visuals:** four mini setups.
- Top left: green, small red, small red, then a big green candle breaking above the first candle's high → Buy; SL at the low of the small red candle.
- Bottom left: green, small red, then a big green breaking above → Buy; SL under the small red candle.
- Top right: red, small green, small green, then a big red candle breaking below → Sell; SL above the small green candle.
- Bottom right: red, small green, then a big red breaking below → Sell; SL above the small green candle.

**Web scene notes:** a quiz. Show one setup at a time; the viewer picks Buy or Sell and clicks where the SL goes; then reveal the answer with the rule (break of the first candle's high/low, SL beyond the pullback candle).

---

## Slide 11: Effective Use of Support & Resistance

**Source:** single image.

**Text on slide:**
- Effective Use of Support & Resistance
- Resistance Zone
- Support Zone
- Resistance: A price level where selling pressure increases and price often reverses down.
- Support: A price level where buying pressure increases and price often bounces up.
- Resistance = Selling Zone | Support = Buying Zone

**Visuals:** candle chart between a red resistance band and a green support band, circles where price touches each band, arrows showing reversals.

**Web scene notes:** built as scene 03. The viewer drags the two lines onto the levels (three touches each), then watches a breakout and retest where old resistance becomes support. Use the two definitions above as the explanatory copy.

---

## Slide 12: Why to Invest in Equities

**Source:** editable text plus images.

**Text on slide:**
- Equities
- Why to Invest in Equities
- During last 20 to 25 years your wealth multiplied by
- FD: 20 Times
- Silver: 24 Times
- Gold: 37 Times
- Equities: 260 Times

**Visuals:** four funnels growing in size (FD, silver bars, gold jewellery, a pile of rupee notes and coins for equities).

**Web scene notes:** a growth calculator. The viewer enters an amount (default ₹10,000) and watches four bars grow by 20×, 24×, 37× and 260×. The deck gives no start year or source for these multiples; state "as per the trainer's figures" or add a source.

---

## Slide 13: Historical Returns of Indian Stocks

**Source:** single image.

**Text on slide:**
- HISTORICAL RETURNS OF INDIAN STOCKS
- Table columns: Stocks | From | Till | Amount invested | Final amount | Amt. in multiple

| Stock | From | Till | Amount invested | Final amount | Amt. in multiple |
|---|---|---|---|---|---|
| Infosys | Jun 1993 | Oct 2017 | 10000 | 11 Crore | 11000 |
| Eicher motors | Jan 1990 | Oct 2017 | 10000 | 2.1 Crore | 2018 |
| Shree cement | Jan 1990 | Oct 2017 | 10000 | 1.91 Crore | 1913 |
| Emami | Oct 1995 | Oct 2017 | 10000 | 0.52 Crore | 523 |
| Asian paints | Jan 1988 | Oct 2017 | 10000 | 0.59 Crore | 590 |
| Sun pharma | Dec 1994 | Oct 2017 | 10000 | 0.26 Crore | 261 |

(The slide spells Emami's start date "Qct 1995"; read as Oct 1995.)

**Visuals:** company logos in the first column, gold coin stacks, green highlight on the result columns.

**Web scene notes:** sortable table plus an animated bar race of ₹10,000 growing to each final amount. Keep "Oct 2017" visible as the end date.

---

## Slide 14: Infosys Returns

**Source:** single image.

**Text on slide:**
- Infosys Returns
- Table columns: YEAR | ACTION | NUMBER OF SHARES | AMOUNT

| Year | Action | Number of shares | Amount |
|---|---|---|---|
| 1993 | Initial Investment | 100 | 10,000 |
| 1994 | 1:1 Bonus | 200 | |
| 1997 | 1:1 Bonus | 400 | |
| 1999 | 1:1 Bonus | 800 | |
| 1999 | Stock split 10 to 5 | 1,600 | |
| 2004 | 3:1 Bonus | 6,400 | |
| 2006 | 1:1 Bonus | 12,800 | |
| 2014 | 1:1 Bonus | 25,600 | |
| 2015 | 1:1 Bonus | 51,200 | |
| 2016 | 1:1 Bonus | 1,02,400 | |
| 2018 | 1:1 Bonus | 2,04,800 | 15,15,52,000/- |

**Visuals:** Infosys campus photo, gold coins, green rising arrow, final amount highlighted.

**Web scene notes:** year-by-year stepper. Each Next press applies one corporate action and the grid of share icons doubles (or quadruples for 3:1). End on 2,04,800 shares worth ₹15,15,52,000. Note: this ends in 2018, while slide 13 ends in Oct 2017 at ₹11 Crore; label each with its end date so they do not look contradictory. Good place to explain bonus vs split.

---

## Slide 15: Course Details

**Source:** editable text plus images.

**Text on slide:**
- Course Details
- Basics of Investment
- Basics of stock market, primary & secondary market
- Fundamental of market
- Image words: stock, bond, fund, gold, Investment, deposit, currency; IPO; Split, Bonus, Buyback, Right, Dividend

**Visuals:** three photos: an "Investment" word-cloud chalkboard, an IPO sign with a rising chart, and a wooden board with Split / Bonus / Buyback / Right / Dividend.

**Web scene notes:** first module of the course syllabus. Expandable list. The five corporate actions (Split, Bonus, Buyback, Rights, Dividend) can be small flip cards with one-line definitions.

---

## Slide 16: Course Highlights

**Source:** single image.

**Text on slide:**
- Course Highlights
- Buy, Sell and Stop Loss
- How you can earn while market is coming down
- Technical Analysis, effective use of Candlestick Patterns
- Line Chart, Indicators & More Trading Strategy
- Chart labels: Volume (200), Oct, Nov, price axis 1467, 1488, 1510, 1530, 1550

**Visuals:** four highlight rows with icons (buy/sell arrows, falling bear chart, candles, line chart with magnifier) beside a tablet showing a candlestick chart with moving averages and volume bars; gold bull.

**Web scene notes:** four highlights beside a live candle chart with a moving average and volume bars. Selecting each highlight changes the chart overlay (stop-loss line; short-sell in a downtrend; a candlestick pattern; indicators).

---

## Slide 17: Option Trading

**Source:** editable text.

**Text on slide:**
- Option Trading…
- What is call option And Put Option
- Option Buying & Selling
- Strike Price selection
- Option Premium Calculation
- Index, Equity , Commodity Option trading Stratergies

**Visuals:** chevron bullets on the navy background, SMISHA logo.

**Web scene notes:** options module. Interactive call/put payoff chart: the viewer picks call or put and buy or sell, drags the strike and premium, and sees profit/loss at expiry. Fix the spelling "Stratergies" to "Strategies" in web copy.

---

## Slide 18: How To read option chain data

**Source:** single image (screenshot of an NSE-style option chain).

**Text on slide:**
- How To read option chain data
- Option Buying & Selling
- Table halves: CALLS | PUTS
- Columns (calls side): OI, CHNG IN OI, VOLUME, IV, LTP, CHNG, BID QTY, BID, ASK, ASK QTY
- Middle column: STRIKE
- Columns (puts side): BID QTY, BID, ASK, ASK QTY, CHNG, LTP, IV, VOLUME, CHNG IN OI, OI
- Strike prices shown: 23,600.00 to 24,100.00 in steps of 50

**Visuals:** magnifying glass, wide option chain table in a gold frame.

**Web scene notes:** a simplified interactive option chain (about 9 strikes around a spot price). Hover a strike to see in-the-money / at-the-money / out-of-the-money shading and what LTP, OI and change in OI mean. Use illustrative numbers; do not copy the screenshot's exact data.

---

## Slide 19: Risk management and psychology

**Source:** editable text plus images.

**Text on slide:**
- How to minimize loss and maximise profit
- Risk management
- Trade setup for trading and investing
- Psychology… very very important (our USP)
- Diagram words: IDENTIFY, ANALYZE, CONTROL, TRANSFER, REDUCE, ASSESS, RISK MANAGEMENT

**Visuals:** a risk-management cycle diagram (identify → analyze → control → transfer → reduce → assess around "Risk Management"); an illustration of a head with a plant growing in the brain.

**Web scene notes:** position-size calculator: capital, risk per trade %, entry and stop-loss → number of shares and amount at risk. Show the six-step risk cycle as a simple animated diagram. Call out psychology as SMISHA's stated USP.

---

## Slide 20: Our USP

**Source:** title text plus a screenshot of a third-party website.

**Text on slide:**
- OUR USP
- Screenshot text (from another trainer's website, not SMISHA's):
  - Fees- Rs 4,00,000/- Plus 10% Profit Sharing.
  - 1 registration INR 4,00,000/ Per Student
  - 2 registrations INR 3,75,000/Per Student
  - 3+ registrations INR 3,50,000/Per Student
  - Incase you want to study face to face, we can take classes in your city Delhi, Mumbai, Pune, Banglore, Calcutta, Chandigarh in advance notification of atleast 2 months.
  - If you can want something ready made with out any cycle search then you can opt for the Gann HNI Course …
  - Includes a link to ruchirgupta.co.in, an email address and a phone number belonging to that trainer.

**Visuals:** website screenshot with social share buttons (1.3k shares).

**Web scene notes:** **do not reproduce this content.** It belongs to a different provider and lists their fees and contact details. The likely intent is to show that comparable Gann courses cost ₹3.5–4 lakh while SMISHA charges ₹25,000. Replace with SMISHA's own USP once the client supplies it (for example: psychology focus, lifetime support, offline practice in Pune). Until then, leave this scene out.

---

## Slide 21: Topic of W.D. Gann

**Source:** editable title plus icon images with text.

**Text on slide:**
- TOPIC OF W.D. GANN
- SQUARE OF 9 & 12: Unique Market Geometry
- TIME CYCLES: Natural Turn Dates
- GANN PHILOSOPHY: Price, Time, Proportion
- GANN ANGLES & FAN: Master 1x1 Line (45° Angle)
- FINANCIAL ASTROLOGY: Planetary Cycles in Markets

**Visuals:** five gold line icons in circles (grid, clock, compass, angle, planet) on navy.

**Web scene notes:** five topic cards. Optional interaction: a small Square of 9 spiral where the viewer enters a price and sees the next levels on the 45° and 90° lines; or a Gann fan drawn from a swing low on a candle chart with the 1x1 line highlighted.

---

## Slide 22: Lifetime Support - Post Course

**Source:** editable text.

**Text on slide:**
- Lifetime Support - Post Course
- Daily Trading Support – Online & Office
- One to One practice at office
- Special batch whats app group
- Software training online & office
- IPO suggestions
- Long term investment suggestions
- Short term investment suggestions
- Stock recommendation
- Batch review without fees
- Trader's club

**Visuals:** tick-mark list, SMISHA logo.

**Web scene notes:** checklist that ticks off one item at a time, or grouped cards (Support, Practice, Community, Research). Note: offering stock recommendations or investment suggestions generally needs SEBI Research Analyst or Investment Adviser registration; confirm the client's status before publishing those three items.

---

## Slide 23: Offer / Pricing

**Source:** single image.

**Text on slide:**
- Course fees Rs 55,000/-
- Offer for You
- Rs 25,000/- Only
- Register Now
- Pay 5000/- now & rest on course date
- Badge: MONEY BACK 100% GUARANTEE

**Visuals:** gold banners, green price panel, calendar and cursor on the Register button, bull silhouette, rising arrow.

**Web scene notes:** pricing card: ₹55,000 struck through, ₹25,000 offer price, "Pay ₹5,000 now, rest on the course date", Register button. The money-back guarantee needs written terms before it is published.

---

## Slide 24: Contact / Thank you

**Source:** single image.

**Text on slide:**
- SMISHA SHARE MARKET CLASSES
- Learn. Analyse. Grow.
- RAHUL KOTKAR
- +91 7420 009 339
- Office No. 415, Gera Imperium Alpha, Kharadi, Pune – 411014
- Follow Us On: Instagram, YouTube, LinkedIn, Facebook
- @smisha_share_market

**Visuals:** large gold logo, office tower at night, candle chart on the right, gold swooshes.

**Web scene notes:** closing scene. Logo, trainer name, phone as selectable text with a tap-to-call link, address with a map link, social handle. Reuse the 3D candle field from the hero so the deck opens and closes the same way.

---

## Content issues to resolve with the client

1. Slide 20 is another provider's content; needs SMISHA's real USP.
2. Slide 3 percentages don't form one 100% chart and have no source.
3. Slide 12 multiples have no period or source.
4. Slides 13 and 14 give different Infosys outcomes (₹11 Cr to Oct 2017 vs ₹15.15 Cr to 2018).
5. Slide 22 "stock recommendation" / investment suggestions and slide 23 "100% money back guarantee" need regulatory and terms review.
