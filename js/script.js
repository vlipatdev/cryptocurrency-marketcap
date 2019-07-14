const subheading = document.querySelector('.subheading');
const spinner = document.querySelector('.spinner');
const coinContainer = document.querySelector('.coin-container');
const buttonContainer = document.querySelector('.button-container');

// generate empty rows onload
const genRows = (n) => {
  for (let i = 0; i < n; i++) {
    coinContainer.insertAdjacentHTML(
      'beforeend',
      `
    <div class="coin-wrapper">
      <span class="coin-rank"></span>
      <span class="coin-id"></span>
      <span class="coin-price"></span>
      <span class="coin-change"></span>
      <span class="coin-marketcap"></span>
    </div>
  `,
    );
  }
};

genRows(10);

let coinWrapperList;
let infoList;

// remove rows
const removeRows = () => {
  coinWrapperList = document.querySelectorAll('.coin-wrapper');
  coinWrapperList.forEach((coinWrapper) => {
    coinWrapper.remove();
  });

  infoList = document.querySelectorAll('.info');
  infoList.forEach((info) => {
    info.remove();
  });
};

// set parameters
const totalCoins = 250;
const coinsPerPage = 50;
let curPage = 1;

let nextBtnList;
let prevBtnList;

// formatting functions
const formatId = id => id
  .split('-')
  .join(' ')
  .toUpperCase();
const formatPrice = (price) => {
  let newPrice;
  if (price > 1) {
    newPrice = parseFloat(price, 10).toFixed(2);
  } else {
    newPrice = parseFloat(price, 10).toFixed(8);
  }
  return newPrice;
};

const formatChange = percentage => parseFloat(percentage, 10).toFixed(2);
const formatNum = num => parseInt(num, 10).toLocaleString('en-US');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const formatDate = d => `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;

// axios
const axiosFn = () => {
  axios
    .get(`https://api.coincap.io/v2/assets?limit=${totalCoins}`)
    .then((result) => {
      spinner.style.display = 'none';
      subheading.style.display = 'block';
      removeRows();
      const resultArr = result.data.data;

      // slice and loop
      resultArr.slice(coinsPerPage * (curPage - 1), coinsPerPage * curPage).forEach((coin, idx) => {
        coinContainer.insertAdjacentHTML(
          'beforeend',
          `
        <button class="coin-wrapper" aria-label="${coin.id}">
          <span class="coin-rank">${coin.rank}</span>
          <img class="logo" src="img/logos/${
  coin.id
}.png" onerror="this.onerror=null;this.src='img/logos/placeholder-logo.png';" alt="${
  coin.id
} logo">
          <span class="coin-id">${formatId(coin.id)}</span>
          <span class="coin-price">$${formatPrice(coin.priceUsd)}</span>
          <span class="coin-change">${formatChange(coin.changePercent24Hr)}%</span>
          <span class="coin-marketcap">$${formatNum(coin.marketCapUsd)}</span>
        </button>
        <div class="info">
          <span class="info-symbol">${formatId(coin.id)} (${coin.symbol})</span>
          <div class="info-container">
            <div>
              <p class="info-rank"><strong>Rank:</strong> ${coin.rank} </p>
              <p class="info-price"><strong>Current Price:</strong> $${formatPrice(
    coin.priceUsd,
  )}</p>
              <p class="info-marketcap"><strong>Market Cap:</strong> $${formatNum(
    coin.marketCapUsd,
  )}</p>
            </div>
            <div>
              <p class="info-volume"><strong>Volume(24hr): </strong> $${formatNum(
    coin.volumeUsd24Hr,
  )}</p>
              <p class="info-supply"><strong>Available Supply: </strong> ${formatNum(
    coin.supply,
  )} ${coin.symbol}</p>
            </div>
          </div>
        <div>
        `,
        );

        // add class on percentage
        const coinChange = document.querySelectorAll('.coin-change');
        if (coin.changePercent24Hr > 0) {
          coinChange[idx].classList.add('positive');
        } else {
          coinChange[idx].classList.add('negative');
        }
      });

      infoList = document.querySelectorAll('.info');
      coinWrapperList = document.querySelectorAll('.coin-wrapper');
      let prevInfo = infoList[0];
      let prevCoin = coinWrapperList[0];
      coinWrapperList.forEach((coinWrapper, idx) => {
        coinWrapper.addEventListener('click', () => {
          if (prevInfo !== infoList[idx]) {
            prevInfo.classList.remove('flex');
            infoList[idx].classList.add('flex');
            prevCoin.classList.remove('selected');
            coinWrapper.classList.add('selected');
            prevInfo = infoList[idx];
            prevCoin = coinWrapper;
          } else {
            infoList[idx].classList.toggle('flex');
            coinWrapper.classList.toggle('selected');
          }
        });
      });

      subheading.textContent = `As of ${formatDate(new Date(result.data.timestamp))}`;
    })
    .catch(error => console.log(error));
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
    buttonContainer.innerHTML = `
      <button class="next" aria-label="next">Page ${curPage + 1} &rarr;</button>
    `;
  } else if (curPage === totalCoins / coinsPerPage) {
    buttonContainer.innerHTML = `
      <button class="previous" arial-label="previous">&larr; Page ${curPage - 1}</button>
    `;
  } else {
    buttonContainer.innerHTML = `
      <button class="previous" aria-label="previous">&larr; Page ${curPage - 1}</button>
      <button class="next" aria-label"next">Page ${curPage + 1} &rarr;</button>
    `;
  }
  nextBtnList = document.querySelectorAll('.next');
  prevBtnList = document.querySelectorAll('.previous');

  nextBtnList.forEach((nextBtn) => {
    nextBtn.addEventListener('click', () => {
      curPage += 1;
      updateUI();
    });
  });

  prevBtnList.forEach((prevBtn) => {
    prevBtn.addEventListener('click', () => {
      curPage -= 1;
      updateUI();
    });
  });
};

// add button onload
addButton();
