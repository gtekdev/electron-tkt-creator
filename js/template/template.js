// Search for '<>' to find the required changes for each ticket.
const Processes = require('./modules/processes.js'); // All common processes with the form.
let Tickets = new function() // All form specific processes.
{
    this.Handler = new function()
    {
        this._error = false;    // PRIVATE BOOL
        this._errorMsg = '';    // PRIVATE STRING
        // Initialize current section.
        this._currentSection = '#input-customer-search'; // PRIVATE STRING
        // All ticket input data
        this._ticketData = {    // PRIVATE OBJECT
            acct_obj: null,

            //<>: <>, ...

            tkt_type: '<>'
        }; /**
            * The ticketData object is all that needs to be
            * updated per ticket form.
            * 
            * POSSIBLE FIELDS:
            * job_type
            * job_tower
            * job_zone
            * job_tower_height[bool]
            * tkt_notes
            * 
            * cst_id
            * cst_name
            * cst_package []
            *       [0] = Res, Bus, or Other
            *       [1] = Package
            * cst_speedtest
            * cst_torch
            * 
            * radio_management
            * radio_public
            * radio_mac
            * radio_speedtest
            * radio_type []
            *       [0] = Make
            *       [1] = Model
            * radio_signal
            * radio_signal_last
            * radio_ccq
            * radio_quality
            * radio_ssid
            * radio_ap_count
            * 
            * SPECIFIC NETWORK ESCALATION FIELDS:
            *       tkt_reason (static ip)
            * 
            *       router_mac
            * 
            *       cst_unit
            *       cst_phone
            *       cst_status
            * 
            *       voip_firmware
            *       voip_mac
            *       voip_public
            * 
            *       mtl_id
            *       tkt_reason
            *       
            *       cst_status = current:
            *           voip_first[bool]
            *           voip_registered[bool]
            *           voip_line[bool]
            *           
            *       cst_status = new:
            *           voip_paid[bool]
            *           voip_assignment
            *           voip_callid
            */

        /**
         * Ticket Form handler
         */
        this.form = {
            that: this, // Bind this (Tickets) to 'that'
            input_ids: builder.getInputIds(), // All form input ids
            /**
             * Clear all repair ticket form fields.
             */
            clear: function()
            {
                for(let i = 0; i < this.input_ids.length; i++) {
                    $('#input-' + this.input_ids[i]).val('');
                }
            },

            /**
             * Fill the ticket with customer data
             * pulled from Sonar.
             */
            fill: function()
            {   // Set values of the data in the ticket form
                this.clear();
                for(let i = 0; i < this.input_ids.length; i++) {
                    $('#input-' + this.input_ids[i]).val(this.that.getTicketDataProperty(this.input_ids[i]));
                }
                // Show ticket form.
                Processes.displayForm(this.that.getCurrentSection(), 
                    (string) => this.that.setCurrentSection(string));
                console.log(this.input_ids);
            },

            /**
             * Handle the submission of the form
             * to Sonar.
             */
            /*<>submit: function()
            {
                Processes.alert.submit.close();
                // Update ticket data with user input
                for(let prop in this.that.getTicketData()) {
                    if(this.that.getTicketDataProperty(prop) === '') {
                        this.that.setTicketDataProperty(prop, $('#input-' + prop).val());
                    }
                }
                console.log(Tickets.Handler.getTicketData());
                <>Processes.submitTicket(Tickets.Handler.getTicketData());
            }*/

        }

        /**
         * Handle account received after the user
         * searches for a customer.
         * 
         * @param {Object} data
         */
        this.handleCustomerAccount = function(data)
        {
            this.form.clear(); // Make a clean form
            this.setTicketData({ acct_obj: data }); // Store customer data
            Processes.displayAccountConfirmation(this.getCurrentSection(), this.getTicketDataProperty('acct_obj').data.name, 
                (string) => this.setCurrentSection(string));
        }

        /**
         * Handle data received from Sonar based on the
         * confirmed account.
         * 
         * @param {Object} data
         */
        this.handleCustomerData = function(data)
        {   // Set customer info
            data.cst_id = this.getTicketDataProperty('acct_obj').data.id;
            data.cst_name = this.getTicketDataProperty('acct_obj').data.name;

            this.setTicketData(data); // Set ticket data pulled from Sonar
            this.form.fill();
        }

        /** PRIVATE VARIABLE GETTERS / SETTERS */

        /**
         * Check if error exists.
         */
        this.hasError = function()
        {
            return this._error;
        }
        /**
         * Set error.
         * @param {boolean} bool 
         */
        this.setError = function(bool)
        {
            this._error = bool;
        }
        /**
         * Get error message if any.
         */
        this.getErrorMessage = function()
        {
            return this._errorMsg;
        }
        /**
         * Set error message.
         * @param {String} string 
         */
        this.setErrorMessage = function(string)
        {
            this._errorMsg = string;
        }
        /**
         * Resets the error and error message.
         */
        this.resetError = function()
        {
            this.setErrorMessage('');
            this.setError(false);
            Processes.displayError('#err-search-cst_id', this.getErrorMessage());
        }
        /**
         * Displays an error passed as an object
         * to the user.
         * 
         * @param {Object} obj
         * @param {String} id 
         */
        this.handleErrorObject = function(errObj, id)
        {
            if(errObj.message) {
                this.setError(true);
                this.setErrorMessage(errObj.message);
                Processes.displayError(id, this.getErrorMessage());
            }
            else
                console.error('Error Object incorrect format!');
        }

        /**
         * Get current section.
         */
        this.getCurrentSection = function()
        {
            return this._currentSection;
        }
        /**
         * Set current section to jquery appropriate
         * string (#ID, .CLASS, etc).
         * 
         * @param {*} string 
         */
        this.setCurrentSection = function(string)
        {
            this._currentSection = string;
        }

        /**
         * Set Ticket Data from user input.
         * 
         * @param {Object} obj 
         */
        this.setTicketData = function(obj)
        {
            for(let prop in obj) {
                if(this._ticketData.hasOwnProperty(prop)) {
                    this._ticketData[prop] = obj[prop];
                }
                else {
                    console.error('Property "' + prop + '" does not exist!');
                }
            }
        }
        /**
         * Set property of the Ticket Data object.
         * 
         * @param {String} property
         * @param {*} val 
         */
        this.setTicketDataProperty = function(property, val)
        {
            if(this._ticketData.hasOwnProperty(property)) {
                this._ticketData[property] = val;
                //console.log(this._ticketData[property]);
            }
            else {
                console.error('Property "' + property + '" does not exist!')
            }
        }
        /**
         * Get the ticket data object.
         */
        this.getTicketData = function()
        {
            return this._ticketData;
        }
        /**
         * Get property of the Ticket Data object.
         * 
         * @param {String} property 
         */
        this.getTicketDataProperty = function(property)
        {
            if(this._ticketData.hasOwnProperty(property)) {
                return this._ticketData[property];
                console.log(this._ticketData[property]);
            }
        }
    }
}










/** Event listeners */

/**
 * Submit ticket on click.
 * "SUBMIT" button
 */
$('#btn-tkt-submit').on('click', () => {
    Processes.alert.submit.show();
});
    // Alert box with buttons when submit button is clicked above.
    /**
     * "SUBMIT" confirm button clicked event.
     */
    $('#btn-submit-confirmation-submit').on('click', () => {
        Tickets.Handler.form.submit();
    });
        // "OKAY" button for submission of ticket.
        $('#btn-submission-close').on('click', () => {
            Processes.alert.submission.close();
        });
    /**
     * "CANCEL" button clicked event.
     */
    $('#btn-submit-confirmation-cancel').on('click', () => {
        Processes.alert.submit.close();
    });

/**
 * Show ticket template on click.
 */
$('#btn-create-tkt').on('click', () => {
    Tickets.Handler.form.clear();
    Processes.displayForm(Tickets.Handler.getCurrentSection(), 
        (string) => Tickets.Handler.setCurrentSection(string));
});

/**
 * Search Sonar for customer.
 * "CHECK ACCOUNT" button
 */
$('#btn-check-acnt').on('click', () => {
    Processes.checkForCustomerAccount((data, err) => {
        if(err) {   // Handle error
            Tickets.Handler.handleErrorObject(err, '#err-search-cst_id');
        }
        else {  // Show data received
            Tickets.Handler.resetError();
            Tickets.Handler.handleCustomerAccount(data);
        }
    });
});
    // Confirm Account alert when above is clicked.
    /**
     * "CONFIRM" button clicked event.
     * Fill ticket form with information pulled from
     * Sonar.
     */
    $('#btn-cst-confirm').on('click', () => {
        Processes.getCustomerData(Tickets.Handler.getTicketDataProperty('acct_obj').data.id, (data, err) => {
            if(err) {  // Handle error
                Tickets.Handler.handleErrorObject(err, '#info-confirm-cst_id');
            }
            else {
                Tickets.Handler.resetError();
                Tickets.Handler.handleCustomerData(data);
            }
        });
    });
    /**
     * "DENY" button clicked event.
     * Go back to customer search.
     */
    $('#btn-cst-deny').on('click', () => {
        Processes.back(Tickets.Handler.getCurrentSection(), 
            (string) => Tickets.Handler.setCurrentSection(string));
    });

/**
 * Clear ticket template.
 */
$('#btn-tkt-clear').on('click', () => {
    Processes.alert.clear.show();
});
    // Alert box with buttons when clear button is clicked above.
    /**
     * "CLEAR" confirm button clicked event.
     */
    $('#btn-clear-confirmation-clear').on('click', () => {
        Processes.alert.clear.close();
        Tickets.Handler.form.clear();
    });

    /**
     * "CANCEL" button clicked event.
     */
    $('#btn-clear-confirmation-cancel').on('click', () => {
        Processes.alert.clear.close();
    });

$('#back-btn').on('click', () => {
    Processes.back(Tickets.Handler.getCurrentSection(), 
        (string) => Tickets.Handler.setCurrentSection(string));
});

/**
 * Disable appropriate fields depending
 * on selected job type.
 */
$('#input-job_type').on('change', () => {
    Processes.disableFields($('#input-job_type').val());
});

/**
 * Tower selected, so select
 * appropriate zone.
 */
$('#input-job_tower').on('change', () => {
    Processes.selectZone($('#input-job_tower option:selected')[0].value)
});

/**
 * Zone selected, set appropriate
 * tower options.
 */
$('#input-job_zone').on('change', () => {
    Processes.setTowerOptions($('#input-job_zone option:selected')[0].value);
});

/**
 * On radio type selection, set model options for selection.
 */
$('#input-radio_type').on('change', () => {
    Processes.setRadioTypeOptions($('#input-radio_type option:selected')[0].value);
});