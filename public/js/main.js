// Define the last action performed, initially set to an empty string
let last_action = '';

// Function to copy a string to the clipboard
const copyToClipboard = (str) => {
  const el = document.createElement('textarea'); // Create a new textarea element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute('readonly', ''); // Make it read-only to prevent modification
  el.style.position = 'absolute'; // Position element to be off-screen
  el.style.left = '-9999px'; // Move element off-screen
  document.body.appendChild(el); // Append the textarea to the body
  const selected = document.getSelection().rangeCount > 0 // Check if there is any content selected
    ? document.getSelection().getRangeAt(0) // Store selection if it exists
    : false; // Otherwise, store false
  el.select(); // Select the content of the textarea
  document.execCommand('copy'); // Execute the "copy" command
  document.body.removeChild(el); // Remove the textarea from the body
  if (selected) { // If there was a selection prior to copying
    document.getSelection().removeAllRanges(); // Remove all ranges from the selection
    document.getSelection().addRange(selected); // Restore the original selection
  }
};

// Function to display the progress indicator
const showProgress = () => {
  $('.encrypt_decrypt_buttons').hide();
  $('#loading').show();
};

// Function to hide the progress indicator
const hideProgress = () => {
  $('.encrypt_decrypt_buttons').show();
  $('#loading').hide();
};

// When the document is ready
$(document).ready(() => {
  $('#btn_copy').click(() => {
    copyToClipboard($('#response_holder .response_text').val()); // Copy response to clipboard
    $('#response_holder .response_msg').text('Response was successfully copied to clipboard.'); // Display message
  });

  $('#btn_download').click(() => {
    let file_name = "ansible_vault_" + last_action + '_' + new Date().toISOString().slice(0, 19).replace(/:/g, '_') + ".txt";
    if ($('#content_file_tab').is(':visible') && document.getElementById('content_file').files.length === 1) {
      let parts = document.getElementById('content_file').files[0].name.split('.');
      parts[parts.length - 2] += "_" + new Date().toISOString().slice(0, 19).replace(/:/g, '_') + '_' + last_action;
      file_name = parts.join('.');
    }
    download($('#response_holder .response_text').val(), file_name, "text/plain"); // Download the response as a file
  });

  $('.btn_encrypt_decrypt').click(async function () {
    showProgress();
    $('#response_holder').hide();
    $('#response_holder .response_text').hide();
    $('#response_holder .export_buttons').hide();

    let content = $('#content_text').val();
    let action = $(this).data('action');
    let passphrase = $('#passphrase').val();

    if ($('#content_file_tab').is(':visible') && document.getElementById('content_file').files.length === 1) {
      content = await new Response(document.getElementById('content_file').files[0]).text();
    }

    if (!passphrase || !content || !action) {
      hideProgress();
      alert('Please fill in passphrase and content!');
      return;
    }

    const data = { passphrase, content, action };

    $.ajax('/api', {
      dataType: 'json',
      type: 'POST',
      data,
      success: (data, status, xhr) => {
        if (data) {
          last_action = data.action === 'encrypt' ? 'encrypted' : 'decrypted';
          $('#response_holder .response_msg').text(data.msg);
          if (data.result) {
            $('#response_holder .export_buttons').show();
            $('#response_holder .response_text').text(data.result);
            $('#response_holder .response_text').show();
          }
        } else {
          $('#response_holder .response_msg').text('Unknown error');
        }
        $('#response_holder').show();
        hideProgress();
      },
      error: (jqXhr, textStatus, errorMessage) => {
        $('#response_holder .response_msg').text(errorMessage);
        $('#response_holder .response_text').hide();
        $('#response_holder').show();
        hideProgress();
      }
    });
  });
});
