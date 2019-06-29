const subheading = document.querySelector('.subheading');
const spinner = document.querySelector('.spinner');
const coinContainer = document.querySelector('.coin-container');
const buttonContainer = document.querySelector('.button-container');

// generate empty rows onload
const genRows = (n) => {
  for (i = 0; i < n; i++) {
    coinContainer.insertAdjacentHTML('beforeend', `
    <div class="coin-wrapper">
      <span class="coin-rank"></span>
      <span class="coin-id"></span>
      <span class="coin-price"></span>
      <span class="coin-change"></span>
      <span class="coin-marketcap"></span>
    </div>
  `);
  }
};

genRows(10);

// remove rows
const removeRows = () => {
  coinContainer.innerHTML = (`
  <div class="table-heading">
    <span class="table-heading-rank">Rank</span>
    <span class="table-heading-id">Name</span>
    <span class="table-heading-price">Price</span>
    <span class="table-heading-change">Change(24h)</span>
    <span class="table-heading-marketcap">Market Capitalization</span>
  </div>
  `);
};

// set parameters
const totalCoins = 250;
const coinsPerPage = 50;
let curPage = 1;

let nextBtn;
let prevBtn;

// formatting functions
const formatId = id => id.split('-').join(' ').toUpperCase();
const formatPrice = (price) => {
  if (price > 1) {
    parseFloat(price, 10).toFixed(2);
  } else {
    parseFloat(price, 10).toFixed(8);
  }
};

const formatChange = percentage => parseFloat(percentage, 10).toFixed(2);
const formatNum = num => parseInt(num, 10).toLocaleString('en-US');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatDate = d => `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;

// axios
const axiosFn = () => {
  axios.get(`https://api.coincap.io/v2/assets?limit=${totalCoins}`)
    .then((result) => {
      spinner.style.display = 'none';
      subheading.style.display = 'block';
      removeRows();
      const resultArr = result.data.data;
      // slice and loop
      resultArr.slice(coinsPerPage * (curPage - 1), coinsPerPage * curPage).map((el, idx) => {
        coinContainer.insertAdjacentHTML('beforeend', `
        <button class="coin-wrapper" aria-label="${el.id}">
          <span class="coin-rank">${el.rank}</span>
          <img class="logo" src="img/logos/${el.id}.png" onerror="this.onerror=null;this.src='img/logos/placeholder-logo.png';" alt="${el.id} logo">
          <span class="coin-id">${formatId(el.id)}</span>
          <span class="coin-price">$${formatPrice(el.priceUsd)}</span>
          <span class="coin-change">${formatChange(el.changePercent24Hr)}%</span>
          <span class="coin-marketcap">$${formatNum(el.marketCapUsd)}</span>
        </button>
        <div class="info">
          <span class="info-symbol">${formatId(el.id)} (${el.symbol})</span>
          <div class="info-container">
            <div>
              <p class="info-rank"><strong>Rank:</strong> ${el.rank} </p>
              <p class="info-price"><strong>Current Price:</strong> $${formatPrice(el.priceUsd)}</p>
              <p class="info-marketcap"><strong>Market Cap:</strong> $${formatNum(el.marketCapUsd)}</p>
            </div>
            <div>
              <p class="info-volume"><strong>Volume(24hr): </strong> $${formatNum(el.volumeUsd24Hr)}</p>
              <p class="info-supply"><strong>Available Supply: </strong> ${formatNum(el.supply)} ${el.symbol}</p>
            </div>
          </div>
        <div>
        `);

        // add class on percentage
        const coinChange = Array.from(document.querySelectorAll('.coin-change'));
        el.changePercent24Hr > 0 ? coinChange[idx].classList.add('positive') : coinChange[idx].classList.add('negative');
      });

      const infoArr = Array.from(document.querySelectorAll('.info'));
      const coinWrapperArr = Array.from(document.querySelectorAll('.coin-wrapper'));
      let prevInfo = infoArr[0];
      let prevCoin = coinWrapperArr[0];
      coinWrapperArr.map((el, idx) => {
        el.addEventListener('click', () => {
          if (prevInfo !== infoArr[idx]) {
            prevInfo.classList.remove('flex');
            infoArr[idx].classList.add('flex');
            prevCoin.classList.remove('selected');
            el.classList.add('selected');
            prevInfo = infoArr[idx];
            prevCoin = el;
          } else {
            infoArr[idx].classList.toggle('flex');
            el.classList.toggle('selected');
          }
        });
      });

      subheading.textContent = `As of ${formatDate(new Date(result.data.timestamp))}`;
    })
    .catch(error => alert(error));
};

axiosFn();

// update ui function
const updateUI = () => {
  removeRows();
  genRows(10);
  axiosFn();
  addButton();
  window.scrollTo(0, 0);
  spinner.style.display = 'block';
  subheading.style.display = 'none';
};

// add button
const addButton = () => {
  if (curPage === 1) {
    buttonContainer.innerHTML = (`
      <button class="next" aria-label="next">Page ${curPage + 1} &rarr;</button>
    `);
  } else if (curPage === totalCoins / coinsPerPage) {
    buttonContainer.innerHTML = (`
      <button class="previous" arial-label="previous">&larr; Page ${curPage - 1}</button>
    `);
  } else {
    buttonContainer.innerHTML = (`
      <button class="previous" aria-label="previous">&larr; Page ${curPage - 1}</button>
      <button class="next" aria-label"next">Page ${curPage + 1} &rarr;</button>
    `);
  }
  nextBtn = Array.from(document.querySelectorAll('.next'));
  prevBtn = Array.from(document.querySelectorAll('.previous'));

  nextBtn.map((el) => {
    el.addEventListener('click', () => {
      curPage++;
      updateUI();
    });
  });

  prevBtn.map((el) => {
    el.addEventListener('click', () => {
      curPage--;
      updateUI();
    });
  });
};

// add button onload
addButton();
