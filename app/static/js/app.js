'use strict';

var app = angular.module('translatr', []);

app.controller('translatrController', function ($scope, $http, $timeout) {
	new Clipboard('.json-output');
	$scope.locales = {
		'af': 'Afrikaans',
		'ar': 'Arabic',
		'az': 'Azerbaijani',
		'be': 'Belarusian',
		'bg': 'Bulgarian',
		'bn': 'Bengali',
		'bs': 'Bosnian',
		'ca': 'Catalan',
		'ceb': 'Cebuano',
		'cs': 'Czech',
		'cy': 'Welsh',
		'da': 'Danish',
		'de': 'German',
		'el': 'Greek',
		'en': 'English',
		'eo': 'Esperanto',
		'es': 'Spanish',
		'et': 'Estonian',
		'eu': 'Basque',
		'fa': 'Persian',
		'fi': 'Finnish',
		'fr': 'French',
		'ga': 'Irish',
		'gl': 'Galician',
		'gu': 'Gujarati',
		'ha': 'Hausa',
		'hi': 'Hindi',
		'hmn': 'Hmong',
		'hr': 'Croatian',
		'ht': 'Haitian Creole',
		'hu': 'Hungarian',
		'hy': 'Armenian',
		'id': 'Indonesian',
		'ig': 'Igbo',
		'is': 'Icelandic',
		'it': 'Italian',
		'iw': 'Hebrew',
		'ja': 'Japanese',
		'jw': 'Javanese',
		'ka': 'Georgian',
		'kk': 'Kazakh',
		'km': 'Khmer',
		'kn': 'Kannada',
		'ko': 'Korean',
		'la': 'Latin',
		'lo': 'Lao',
		'lt': 'Lithuanian',
		'lv': 'Latvian',
		'mg': 'Malagasy',
		'mi': 'Maori',
		'mk': 'Macedonian',
		'ml': 'Malayalam',
		'mn': 'Mongolian',
		'mr': 'Marathi',
		'ms': 'Malay',
		'mt': 'Maltese',
		'my': 'Myanmar (Burmese)',
		'ne': 'Nepali',
		'nl': 'Dutch',
		'no': 'Norwegian',
		'ny': 'Chichewa',
		'pa': 'Punjabi',
		'pl': 'Polish',
		'pt': 'Portuguese',
		'ro': 'Romanian',
		'ru': 'Russian',
		'si': 'Sinhala',
		'sk': 'Slovak',
		'sl': 'Slovenian',
		'so': 'Somali',
		'sq': 'Albanian',
		'sr': 'Serbian',
		'st': 'Sesotho',
		'su': 'Sundanese',
		'sv': 'Swedish',
		'sw': 'Swahili',
		'ta': 'Tamil',
		'te': 'Telugu',
		'tg': 'Tajik',
		'th': 'Thai',
		'tl': 'Filipino',
		'tr': 'Turkish',
		'uk': 'Ukrainian',
		'ur': 'Urdu',
		'uz': 'Uzbek',
		'vi': 'Vietnamese',
		'yi': 'Yiddish',
		'yo': 'Yoruba',
		'zh': 'Chinese',
		'zh-CN': 'Chinese (Simplified)',
		'zh-TW': 'Chinese (Traditional)',
		'zu': 'Zulu'
		};

		$scope.settings = {};
		$scope.settings.selectedLocales = {};
		$scope.jsonFormattedOutput = [];
		$scope.settings.isLangUagePanelExpandable = true;

		$scope.utils = {
			/**
			 * Get local storage data decode it before using it
			 * @return {String}
			 */
			getLocalStorageData: function () {
				var data;
				if (localStorage.getItem('translatr_app_data')) {
					data = atob(localStorage.getItem('translatr_app_data'));
					return JSON.parse(data);
				}
				return false;
			},
			/**
			 * Save data to local storage
			 * @param {String/Number}  data
			 */
			setLocalStorageData: function (data) {
				localStorage.setItem('translatr_app_data', btoa(JSON.stringify(data)));
			}
		};

		$('#text').focus();

		$scope.storedData = $scope.utils.getLocalStorageData();
		$scope.loadStoredData = function () {
			// Reset all checkboxes
			$scope.settings.selectedLocales = {};
			$scope.storedData = $scope.utils.getLocalStorageData();
			var i;
			$scope.userText = $scope.storedData.t;
			for (i = 0; i < $scope.storedData.l.length; i++) {
				$scope.settings.selectedLocales[$scope.storedData.l[i]] = true;
			};

			$scope.isStoredDataLoaded = true;
		};

		$scope.getSelectedLocales = function () {
			var selectedlocales = [];
			angular.forEach($scope.settings.selectedLocales, function (v, k) {
				if (v) { selectedlocales.push(k); }
			});
			return selectedlocales;
		};

		$scope.resetInput = function () {
			$scope.userText = '';
			$scope.settings.selectedLocales = {};
			$scope.isStoredDataLoaded = !$scope.isStoredDataLoaded;
		};

		$scope.validateAndTranslate = function () {
			// List of selected locles, send them to backend, `l` to optimize request
			var l = [];
			var params = {};

			angular.forEach($scope.settings.selectedLocales, function (value, key) {
				if (value) {
					l.push({locale: key});
				}
			});
			$scope.isPositive = false;

			if (!$scope.userText) {
				$scope.errorText = 'Please enter valid text.';
				return;
			}

			if (!l.length) {
				$scope.errorText = 'Please select at leat one language.';
				return;
			}

			$scope.errorText = '';
			$scope.translatedText = {};
			$scope.jsonFormattedOutput = [];
			$scope.isFetchingData = true;

			params.userText = $scope.userText;
			params.l = l;

			$scope.isPositive = true;
			$scope.errorText = 'Please wait, crunching latest data.';
			$http.post('', params).then(function (config) {
				$scope.errorText = '';
				$scope.isFetchingData = false;
				$scope.isStoredDataLoaded = true;
				$scope.translatedText = config.data.translatedText.text;
				if ($scope.settings.isJsonFormattedOutput) {
					$scope.generateJsonFormattedOutput($scope.translatedText);
				}

				$scope.utils.setLocalStorageData({t: $scope.userText, l: $scope.getSelectedLocales()});
				$timeout(function () {
					$('body, html').animate({scrollTop: document.getElementById('output').offsetTop}, 'slow');
				}, 0);

			}, //error
				function () {
					$scope.isFetchingData = false;
					$scope.isPositive = false;
					$scope.errorText = 'Something went wrong. Please try again.';
				})
			;
		};

		$scope.generateJsonFormattedOutput = function (data) {
			var jsonFormattedOutput = [];
			var obj = {};
			angular.forEach(data, function (v, k) {
				obj = {};
				obj.locale = k;
				obj.country = $scope.locales[k];
				obj.string = v;
				jsonFormattedOutput.push(obj);
			});
			$scope.jsonFormattedOutput = JSON.stringify(jsonFormattedOutput);
		};

		$scope.highlightTranslatedString = function (locale) {
	        var range;
	        if (document.selection) {
	            range = document.body.createTextRange();
	            range.moveToElementText(document.getElementById('selectedText-' + locale));
	            range.select();
	        } else if (window.getSelection) {
	            range = document.createRange();
	            range.selectNode(document.getElementById('selectedText-' + locale));
	            window.getSelection().addRange(range);
	        }
	    };

	    $scope.copyText = function () {
	    	$scope.isTextCopied = true;
	    	$timeout(function () {
	    		$scope.isTextCopied = false;
	    	}, 2000);
	    };
});

app.$inject = [ '$scope', '$http', '$timeout' ];
