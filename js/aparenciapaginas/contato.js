$(function () {
	const form = $('#ContatoContatoForm');

	form.validate();

	form.find(':input').on('blur change keyup', function () {
		__enableDisableButtonSubmit('#ContatoContatoForm', '#send-form');
	});

	form.on('submit', function () {
		if ($('#ContatoContatoForm').valid()) {
			$('.loading-page').fadeIn();
			return true;
		}
	});
});

function sendForm() {
	const siteKey = $('#ContatoContatoForm').data('site-key');

	grecaptcha.enterprise.ready(function () {
		grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(function (tokenRecaptcha) {
			$('#ContatoContatoForm').submit();
		});
	});
}
