import { LightningElement, api, track } from 'lwc';

export default class PaymentForm extends LightningElement {
    @api recordId;

    @track showSpinnerLoading = false;
    @track cardValid = false;
    @track formValid = false;
    @track addressValid = false;
    @track disableHandlers = true;
    @track rendered = false;
    @track internationalAddress = false;

    @track spinnerClass = 'loading';

    @track price = 0;
    @track total = 0;
    @track priceFormatted;
    @track totalFormatted;
    @track paymentType = 'Prepaid';
    @track variation = '';
    @track newOrder = {};
    @track newOrderItems = [];
    @track newAccount = {
        BillingStreet: '',
        BillingCity: '',
        BillingState: '',
        BillingPostalCode: '',
        BillingCountry: ''
    };
    @track paymentMethods = [
        {
            label: 'Credit Card',
            value: 'Credit Card',
            selected: true
        },
        { label: 'Purchase Order', value: 'Purchase Order' },
        { label: 'Check', value: 'Check' }
    ];
    @track paymentMethod = 'Credit Card';
    @track checkNumber = '';
    @track poNumber = '';
    stateoptions = [];
    @track countryOptions = [];

    connectedCallback() {
        this.disableHandlers = true;
        this.showSpinner('loading');
        // this.getContext();
        this.loadStateOptions();
        this.loadCountryOptions();
        // this.initializeOrderData();
        this.disableHandlers = false;
        this.hideSpinner();
    }

    onRender() {
        //run once
        if (this.rendered === false) {
            this.rendered = true;
            this.checkIfAddressValid();
        }
    }

    handleCloseClick() {
        // component.getEvent('wizardClose').fire();
    }

    handleNextClick() {
        this.processPayment();
    }

    handlePreviousClick() {
        this.saveContext();
        // component.getEvent('wizardBack').fire();
    }

    handlePaymentMethodSelect(event) {
        this.paymentMethod = event.target.value;
    }

    handlePaymentMethodChange() {
        this.checkIfFormValid();
    }

    handleCardComplete(event) {
        const cardData = event.target.value;
        this.cardValid = true;
        this.cardDetails = cardData;
        this.checkIfFormValid();
    }

    handleCardIncomplete() {
        this.cardValid = false;
        this.cardDetails = {};
        this.checkIfFormValid();
    }

    handleAddressValid(event) {
        const addressData = event.target.value;
        this.addressValid = true;
        this.newAccount.BillingCountry =
            addressData.BillingCountry === 'United States'
                ? 'USA'
                : addressData.BillingCountry;
        this.newAccount.BillingCity = addressData.BillingCity;
        this.newAccount.BillingState = addressData.BillingState;
        this.newAccount.BillingPostalCode = addressData.BillingPostalCode;
        this.newAccount.BillingStreet = addressData.BillingStreet;

        // eslint-disable-next-line no-console
        console.log(JSON.stringify(this.newAccount));

        this.checkIfFormValid();
    }

    handleAddressInvalid() {
        this.addressValid = false;
        this.checkIfFormValid();
    }

    handleCheckChange(event) {
        var val = event.target.value;
        this.checkNumber = val;
        this.checkIfFormValid();
    }

    handleGroupAccountChange() {
        if (this.disableHandlers === true) {
            return;
        }
        this.checkIfFormValid();
    }

    handlePOChange(event) {
        var val = event.target.value;

        if (!val) {
            this.template
                .querySelectorAll('.purchaseOrderError')[0]
                .classList.remove('slds-hide');
            this.template
                .querySelectorAll('.purchaseOrderForm')[0]
                .classList.add('slds-has-error');
        } else {
            this.template
                .querySelectorAll('.purchaseOrderError')[0]
                .classList.add('slds-hide');
            this.template
                .querySelectorAll('.purchaseOrderForm')[0]
                .classList.remove('slds-has-error');
        }
        this.poNumber = val;
        this.checkIfFormValid();
    }

    displayError(event) {
        var data = event.target.data;
        var errorTitle = data.errorTitle;
        var error = data.error;
        this.notify(error, 'error');
        // eslint-disable-next-line no-console
        console.log(errorTitle + ' ' + error);
    }

    displayNotification(event) {
        var errorTitle = event.target.errorTitle;
        var error = event.target.error;
        this.reportError(errorTitle, error);
        // eslint-disable-next-line no-console
        console.log(errorTitle + ' ' + error);
    }

    checkIfFormValid() {
        let formValid = false;

        let paymentValid = this.checkIfPaymentValid();
        let addressValid = this.checkIfAddressValid();

        if (paymentValid && addressValid) {
            formValid = true;
        }
        this.formValid = formValid;
    }

    checkIfPaymentValid() {
        let paymentMethod = this.paymentMethod;
        let cardValid = this.cardValid;
        let paymentValid = false;

        if (paymentMethod === 'Check') {
            let checkNumber = this.checkNumber;
            if (Array.isArray(checkNumber) && checkNumber.length) {
                paymentValid = true;
            }
        } else if (paymentMethod === 'Credit Card' && cardValid) {
            paymentValid = true;
        } else if (paymentMethod === 'Purchase Order') {
            let poNumber = this.poNumber;
            if (Array.isArray(poNumber) && poNumber.length) {
                paymentValid = true;
            }
        }
        return paymentValid;
    }

    checkIfAddressValid() {
        return this.addressValid;
    }

    showSpinner(spinnerClass) {
        let spinnerClassIsEmpty =
            Array.isArray(spinnerClass) && spinnerClass.length;
        this.spinnerClass = spinnerClassIsEmpty ? 'loading' : spinnerClass;
        this.showSpinnerLoading = true;
    }

    hideSpinner() {
        this.showSpinnerLoading = false;
    }

    loadStateOptions() {
        var states = [
            {
                value: '',
                label: 'Select a State',
                selected: false
            },
            { value: 'CA', label: 'California' }
        ];
        return states;
    }

    loadCountryOptions() {
        var rawCountries = [
            {
                value: '',
                label: 'Select a Country',
                selected: false
            },
            { value: 'Afghanistan', code: 'AF' },
            { value: 'Åland Islands', code: 'AX' },
            { value: 'Albania', code: 'AL' },
            { value: 'Algeria', code: 'DZ' },
            { value: 'American Samoa', code: 'AS' },
            { value: 'Andorra', code: 'AD' },
            { value: 'Angola', code: 'AO' },
            { value: 'Anguilla', code: 'AI' },
            { value: 'Antarctica', code: 'AQ' },
            { value: 'Antigua and Barbuda', code: 'AG' },
            { value: 'Argentina', code: 'AR' },
            { value: 'Armenia', code: 'AM' },
            { value: 'Aruba', code: 'AW' },
            { value: 'Australia', code: 'AU' },
            { value: 'Austria', code: 'AT' },
            { value: 'Azerbaijan', code: 'AZ' },
            { value: 'Bahamas', code: 'BS' },
            { value: 'Bahrain', code: 'BH' },
            { value: 'Bangladesh', code: 'BD' },
            { value: 'Barbados', code: 'BB' },
            { value: 'Belarus', code: 'BY' },
            { value: 'Belgium', code: 'BE' },
            { value: 'Belize', code: 'BZ' },
            { value: 'Benin', code: 'BJ' },
            { value: 'Bermuda', code: 'BM' },
            { value: 'Bhutan', code: 'BT' },
            { value: 'Bolivia', code: 'BO' },
            { value: 'Bosnia and Herzegovina', code: 'BA' },
            { value: 'Botswana', code: 'BW' },
            { value: 'Bouvet Island', code: 'BV' },
            { value: 'Brazil', code: 'BR' },
            {
                value: 'British Indian Ocean Territory',
                code: 'IO'
            },
            { value: 'Brunei Darussalam', code: 'BN' },
            { value: 'Bulgaria', code: 'BG' },
            { value: 'Burkina Faso', code: 'BF' },
            { value: 'Burundi', code: 'BI' },
            { value: 'Cambodia', code: 'KH' },
            { value: 'Cameroon', code: 'CM' },
            { value: 'Canada', code: 'CA' },
            { value: 'Cape Verde', code: 'CV' },
            { value: 'Cayman Islands', code: 'KY' },
            { value: 'Central African Republic', code: 'CF' },
            { value: 'Chad', code: 'TD' },
            { value: 'Chile', code: 'CL' },
            { value: 'China', code: 'CN' },
            { value: 'Christmas Island', code: 'CX' },
            { value: 'Cocos (Keeling) Islands', code: 'CC' },
            { value: 'Colombia', code: 'CO' },
            { value: 'Comoros', code: 'KM' },
            { value: 'Congo', code: 'CG' },
            {
                value: 'Congo, The Democratic Republic of the',
                code: 'CD'
            },
            { value: 'Cook Islands', code: 'CK' },
            { value: 'Costa Rica', code: 'CR' },
            { value: "Cote D'Ivoire", code: 'CI' },
            { value: 'Croatia', code: 'HR' },
            { value: 'Cuba', code: 'CU' },
            { value: 'Cyprus', code: 'CY' },
            { value: 'Czech Republic', code: 'CZ' },
            { value: 'Denmark', code: 'DK' },
            { value: 'Djibouti', code: 'DJ' },
            { value: 'Dominica', code: 'DM' },
            { value: 'Dominican Republic', code: 'DO' },
            { value: 'Ecuador', code: 'EC' },
            { value: 'Egypt', code: 'EG' },
            { value: 'El Salvador', code: 'SV' },
            { value: 'Equatorial Guinea', code: 'GQ' },
            { value: 'Eritrea', code: 'ER' },
            { value: 'Estonia', code: 'EE' },
            { value: 'Ethiopia', code: 'ET' },
            { value: 'Falkland Islands (Malvinas)', code: 'FK' },
            { value: 'Faroe Islands', code: 'FO' },
            { value: 'Fiji', code: 'FJ' },
            { value: 'Finland', code: 'FI' },
            { value: 'France', code: 'FR' },
            { value: 'French Guiana', code: 'GF' },
            { value: 'French Polynesia', code: 'PF' },
            { value: 'French Southern Territories', code: 'TF' },
            { value: 'Gabon', code: 'GA' },
            { value: 'Gambia', code: 'GM' },
            { value: 'Georgia', code: 'GE' },
            { value: 'Germany', code: 'DE' },
            { value: 'Ghana', code: 'GH' },
            { value: 'Gibraltar', code: 'GI' },
            { value: 'Greece', code: 'GR' },
            { value: 'Greenland', code: 'GL' },
            { value: 'Grenada', code: 'GD' },
            { value: 'Guadeloupe', code: 'GP' },
            { value: 'Guam', code: 'GU' },
            { value: 'Guatemala', code: 'GT' },
            { value: 'Guernsey', code: 'GG' },
            { value: 'Guinea', code: 'GN' },
            { value: 'Guinea-Bissau', code: 'GW' },
            { value: 'Guyana', code: 'GY' },
            { value: 'Haiti', code: 'HT' },
            {
                value: 'Heard Island and Mcdonald Islands',
                code: 'HM'
            },
            {
                value: 'Holy See (Vatican City State)',
                code: 'VA'
            },
            { value: 'Honduras', code: 'HN' },
            { value: 'Hong Kong', code: 'HK' },
            { value: 'Hungary', code: 'HU' },
            { value: 'Iceland', code: 'IS' },
            { value: 'India', code: 'IN' },
            { value: 'Indonesia', code: 'ID' },
            { value: 'Iran, Islamic Republic Of', code: 'IR' },
            { value: 'Iraq', code: 'IQ' },
            { value: 'Ireland', code: 'IE' },
            { value: 'Isle of Man', code: 'IM' },
            { value: 'Israel', code: 'IL' },
            { value: 'Italy', code: 'IT' },
            { value: 'Jamaica', code: 'JM' },
            { value: 'Japan', code: 'JP' },
            { value: 'Jersey', code: 'JE' },
            { value: 'Jordan', code: 'JO' },
            { value: 'Kazakhstan', code: 'KZ' },
            { value: 'Kenya', code: 'KE' },
            { value: 'Kiribati', code: 'KI' },
            {
                value: "Korea, Democratic People's Republic of",
                code: 'KP'
            },
            { value: 'Korea, Republic of', code: 'KR' },
            { value: 'Kuwait', code: 'KW' },
            { value: 'Kyrgyzstan', code: 'KG' },
            {
                value: "Lao People's Democratic Republic",
                code: 'LA'
            },
            { value: 'Latvia', code: 'LV' },
            { value: 'Lebanon', code: 'LB' },
            { value: 'Lesotho', code: 'LS' },
            { value: 'Liberia', code: 'LR' },
            { value: 'Libyan Arab Jamahiriya', code: 'LY' },
            { value: 'Liechtenstein', code: 'LI' },
            { value: 'Lithuania', code: 'LT' },
            { value: 'Luxembourg', code: 'LU' },
            { value: 'Macao', code: 'MO' },
            {
                value: 'Macedonia, The Former Yugoslav Republic of',
                code: 'MK'
            },
            { value: 'Madagascar', code: 'MG' },
            { value: 'Malawi', code: 'MW' },
            { value: 'Malaysia', code: 'MY' },
            { value: 'Maldives', code: 'MV' },
            { value: 'Mali', code: 'ML' },
            { value: 'Malta', code: 'MT' },
            { value: 'Marshall Islands', code: 'MH' },
            { value: 'Martinique', code: 'MQ' },
            { value: 'Mauritania', code: 'MR' },
            { value: 'Mauritius', code: 'MU' },
            { value: 'Mayotte', code: 'YT' },
            { value: 'Mexico', code: 'MX' },
            {
                value: 'Micronesia, Federated States of',
                code: 'FM'
            },
            { value: 'Moldova, Republic of', code: 'MD' },
            { value: 'Monaco', code: 'MC' },
            { value: 'Mongolia', code: 'MN' },
            { value: 'Montserrat', code: 'MS' },
            { value: 'Morocco', code: 'MA' },
            { value: 'Mozambique', code: 'MZ' },
            { value: 'Myanmar', code: 'MM' },
            { value: 'Namibia', code: 'NA' },
            { value: 'Nauru', code: 'NR' },
            { value: 'Nepal', code: 'NP' },
            { value: 'Netherlands', code: 'NL' },
            { value: 'Netherlands Antilles', code: 'AN' },
            { value: 'New Caledonia', code: 'NC' },
            { value: 'New Zealand', code: 'NZ' },
            { value: 'Nicaragua', code: 'NI' },
            { value: 'Niger', code: 'NE' },
            { value: 'Nigeria', code: 'NG' },
            { value: 'Niue', code: 'NU' },
            { value: 'Norfolk Island', code: 'NF' },
            { value: 'Northern Mariana Islands', code: 'MP' },
            { value: 'Norway', code: 'NO' },
            { value: 'Oman', code: 'OM' },
            { value: 'Pakistan', code: 'PK' },
            { value: 'Palau', code: 'PW' },
            {
                value: 'Palestinian Territory, Occupied',
                code: 'PS'
            },
            { value: 'Panama', code: 'PA' },
            { value: 'Papua New Guinea', code: 'PG' },
            { value: 'Paraguay', code: 'PY' },
            { value: 'Peru', code: 'PE' },
            { value: 'Philippines', code: 'PH' },
            { value: 'Pitcairn', code: 'PN' },
            { value: 'Poland', code: 'PL' },
            { value: 'Portugal', code: 'PT' },
            { value: 'Puerto Rico', code: 'PR' },
            { value: 'Qatar', code: 'QA' },
            { value: 'Reunion', code: 'RE' },
            { value: 'Romania', code: 'RO' },
            { value: 'Russian Federation', code: 'RU' },
            { value: 'RWANDA', code: 'RW' },
            { value: 'Saint Helena', code: 'SH' },
            { value: 'Saint Kitts and Nevis', code: 'KN' },
            { value: 'Saint Lucia', code: 'LC' },
            { value: 'Saint Pierre and Miquelon', code: 'PM' },
            {
                value: 'Saint Vincent and the Grenadines',
                code: 'VC'
            },
            { value: 'Samoa', code: 'WS' },
            { value: 'San Marino', code: 'SM' },
            { value: 'Sao Tome and Principe', code: 'ST' },
            { value: 'Saudi Arabia', code: 'SA' },
            { value: 'Senegal', code: 'SN' },
            { value: 'Serbia and Montenegro', code: 'CS' },
            { value: 'Seychelles', code: 'SC' },
            { value: 'Sierra Leone', code: 'SL' },
            { value: 'Singapore', code: 'SG' },
            { value: 'Slovakia', code: 'SK' },
            { value: 'Slovenia', code: 'SI' },
            { value: 'Solomon Islands', code: 'SB' },
            { value: 'Somalia', code: 'SO' },
            { value: 'South Africa', code: 'ZA' },
            {
                value: 'South Georgia and the South Sandwich Islands',
                code: 'GS'
            },
            { value: 'Spain', code: 'ES' },
            { value: 'Sri Lanka', code: 'LK' },
            { value: 'Sudan', code: 'SD' },
            { value: 'Suriname', code: 'SR' },
            { value: 'Svalbard and Jan Mayen', code: 'SJ' },
            { value: 'Swaziland', code: 'SZ' },
            { value: 'Sweden', code: 'SE' },
            { value: 'Switzerland', code: 'CH' },
            { value: 'Syrian Arab Republic', code: 'SY' },
            { value: 'Taiwan, Province of China', code: 'TW' },
            { value: 'Tajikistan', code: 'TJ' },
            {
                value: 'Tanzania, United Republic of',
                code: 'TZ'
            },
            { value: 'Thailand', code: 'TH' },
            { value: 'Timor-Leste', code: 'TL' },
            { value: 'Togo', code: 'TG' },
            { value: 'Tokelau', code: 'TK' },
            { value: 'Tonga', code: 'TO' },
            { value: 'Trinidad and Tobago', code: 'TT' },
            { value: 'Tunisia', code: 'TN' },
            { value: 'Turkey', code: 'TR' },
            { value: 'Turkmenistan', code: 'TM' },
            { value: 'Turks and Caicos Islands', code: 'TC' },
            { value: 'Tuvalu', code: 'TV' },
            { value: 'Uganda', code: 'UG' },
            { value: 'Ukraine', code: 'UA' },
            { value: 'United Arab Emirates', code: 'AE' },
            { value: 'United Kingdom', code: 'GB' },
            { value: 'United States', code: 'US' },
            {
                value: 'United States Minor Outlying Islands',
                code: 'UM'
            },
            { value: 'Uruguay', code: 'UY' },
            { value: 'Uzbekistan', code: 'UZ' },
            { value: 'Vanuatu', code: 'VU' },
            { value: 'Venezuela', code: 'VE' },
            { value: 'Viet Nam', code: 'VN' },
            { value: 'Virgin Islands, British', code: 'VG' },
            { value: 'Virgin Islands, U.S.', code: 'VI' },
            { value: 'Wallis and Futuna', code: 'WF' },
            { value: 'Western Sahara', code: 'EH' },
            { value: 'Yemen', code: 'YE' },
            { value: 'Zambia', code: 'ZM' },
            { value: 'Zimbabwe', code: 'ZW' }
        ];

        rawCountries.forEach(country => {
            if (country.value === '') {
                return;
            }
            country.label = country.value;
            country.selected = false;
        });
        this.countryOptions = rawCountries;
    }

    get paymentMethodEqualsCheck() {
        return this.paymentMethod === 'Check';
    }
    get paymentMethodEqualsPurchaseOrder() {
        return this.paymentMethod === 'Purchase Order';
    }
    get cardInputStyle() {
        return this.paymentMethod !== 'Credit Card'
            ? 'visibility: hidden; height: 0;'
            : '';
    }
    get buttonDisabled() {
        return !this.formValid || !this.addressValid;
    }
}
