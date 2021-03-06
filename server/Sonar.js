const sonar = require('node-sonar-api');

let Sonar = new function()
{

    // Template of GET request options for proper https request.
    let options = {
        host: 'gtek.sonar.software',
        user: '',
        pass: ''
    }

    this.Customer = new function()
    {
        /**
         * Get the customer data from Sonar provided ID.
         * @param {*} id 
         * @param {*} name
         * @param {*} username
         * @param {*} password
         * @param {*} callback
         */
        this.GetCustomer = function(id, username, password, callback)
        {
            options.path = '/api/v1/accounts/' + id;
            options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            options.method = 'GET';
            this.callback = callback;

            this.getData(options, this.callback);
        }

        /**
         * Get the customer ip assignments.
         * @param {*} id 
         * @param {*} username 
         * @param {*} password 
         * @param {*} callback 
         */
        this.GetIPAssignments = function(id, username, password, callback)
        {
            options.path = '/api/v1/accounts/' + id + '/ip_assignments';
            options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            options.method = 'GET';
            this.callback = callback;

            this.getData(options, this.callback);
        }

        /**
         * Get a single inventory item.
         * @param {*} id - of inventory item
         * @param {*} username 
         * @param {*} password 
         * @param {*} callback 
         */
        this.GetInventoryItem = function(id, username, password, callback)
        {
            options.path = '/api/v1/inventory/items/' + id;
            options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            options.method = 'GET';
            this.callback = callback;

            this.getData(options, this.callback);
        }

        /**
         * Get all inventory items.
         * @param {*} id - of user account
         * @param {*} username 
         * @param {*} password 
         * @param {*} callback 
         */
        this.GetInventoryItems = function(id, username, password, callback)
        {
            options.path = '/api/v1/accounts/' + id + '/inventory_items';
            options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            options.method = 'GET';
            this.callback = callback;

            this.getData(options, this.callback);
        }

        /**
         * Get the package/service the customer has on the account.
         * @param {*} id 
         * @param {*} username 
         * @param {*} password 
         * @param {*} callback 
         */
        this.GetServices = function(id, username, password, callback)
        {
            options.path = '/api/v1/accounts/' + id + '/services';
            options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            options.method = 'GET';
            this.callback = callback;

            this.getData(options, this.callback);

        }


        /**
         * This is the actual https request to the Sonar API.
         * @param {*} options 
         * @param {*} callback 
         */
        this.getData = function(options, callback)
        {
            https.request(options, (res) => {
                let body = '';  // body of JSON.

                res.on('data', (chunk) => { // data is received.
                    body += chunk;
                });

                res.on('end', () => { // when finished parsing data.
                    let data = JSON.parse(body);
                    callback(data);
                });

                res.on('error', (e) => {
                    console.log(e.message);
                });

            }).end();
        }
    }

    this.Towers = new function()
    {
        /**
         * Get all towers from Sonar.
         * @param {*} id 
         * @param {*} username 
         * @param {*} password 
         * @param {*} callback 
         */
        this.GetTowers = function(username, password, callback)
        {
            const client = sonar.createClient({
                sonarHost: options.host,
                sonarUsername: username,
                sonarPassword: password
            });

            client.getAll.networkSites()
                .then(json => callback(json));

            // options.path = '/api/v1/network/network_sites';
            // options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            // options.method = 'GET';
            // this.callback = callback;

            // this.getData(options, this.callback);
        }
        
        /**
         * Http request to Sonar to retreive data.
         * @param {*} options 
         * @param {*} callback 
         */
        let resData = []; // Global for appending tower info
        this.getData = function(options, username, password, callback, data)
        {
            // Check if page needs to be specified.
            let postData;
            if(data) {
                postData = JSON.stringify(data);
            }

            let req = https.request(options, (res) => {
                let body = '';  // body of JSON.

                res.on('data', (chunk) => { // data is received.
                    body += chunk;
                });

                res.on('end', () => { // when finished parsing data.
                    let parsedBody = JSON.parse(body);
                    resData = resData.concat(parsedBody.data);
                    parsedBody.data = resData;
                    
                    // Check if extra request needs to be made.
                    if(parsedBody.paginator.current_page < parsedBody.paginator.total_pages) {
                        // Update to next page
                        let page = parsedBody.paginator.current_page + 1;
                        let data = { page: page.toString() }; // Set page object
                        postData = JSON.stringify(data);

                        // Create auth and parameter headers
                        options.headers = {
                            'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64'),
                            'Content-Type': 'application/json',
                            'Content-Length': postData.length
                        }

                        // Make extra request.
                        this.getData(options, username, password, callback, data);

                    } else {
                        callback(parsedBody);
                    }
                });

            });

            if(data) req.write(postData);
            req.end();
        }
    }

    this.Login = new function()
    {
        /**
         * This tests the username and password entered by the user.
         */
        this.Authenticate = function(username, password, callback) 
        {
            const client = sonar.createClient({
                sonarHost: options.host,
                sonarUsername: username,
                sonarPassword: password
            });

            client.getAll.users()
                .then(json => callback(json));

            // options.path = '/api/v1/users';
            // options.headers = {'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64')};
            // options.method = 'GET';
            // this.callback = callback;

            // this.getData(options, this.callback);
        }

        /**
         * Handles the login of the user.
         * @param {*} data
         * @param {*} callback
         */
        this.handleLogin = function(data, callback)
        {
            this.data = data;
            callback(this.data);
        }

        /**
         * This is the actual https request to the Sonar API.
         * @param {*} options 
         * @param {*} callback 
         */
        this.getData = function(options, callback)
        {
            https.request(options, (res) => {
                let body = ''; // body of JSON.

                res.on('data', (chunk) => { // when data is received.
                    body += chunk;
                });

                res.on('end', () => {   // when finished parsing data.
                    let data = JSON.parse(body);
                    this.handleLogin(data, callback);
                });

            }).end();
        }
    }

    this.Ticket = new function()
    {
        /**
         * Submit ticket to Sonar by creating a new job on the given account.
         */
        this.Submit = function(id, template, tkt_id, job_type_id, username, password, callback)
        {
            this.callback = callback;

            this.postData(id, template, tkt_id, job_type_id, username, password, this.callback);
        }

        this.SubmitAsTicket = function(id, template, subject, group_id, cat_id, username, password, callback)
        {
            this.callback = callback;

            this.postTicketData(id, template, subject, group_id, cat_id, username, password, this.callback);
        }

        this.UpdateCustomFields = function(obj, data, username, password, callback)
        {
            this.callback = callback;

            this.updateField(28, obj.cst_tower_height, data, username, password, this.callback);

            let business = false;
            if(obj.cst_package[0] == 'Business')
                business = true;
    
            console.log(obj.cst_package[0], business);

            this.updateField(22, business, data, username, password, this.callback);
        }

        this.updateField = function(id, fieldData, objData, username, password, callback)
        {
            let postData = JSON.stringify(
                {
                    data: fieldData
                }
            );

            options.path = '/api/v1/entity_custom_fields/jobs/' + objData.data.id + '/' + id;
            options.headers = {
                'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64'),
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
            options.method = 'PATCH';

            console.log(postData);
            console.log(options.path);

            let req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    callback(JSON.parse(body));
                });
            });

            req.on('error', (e) => {
                console.log('ERROR w/ POST: ' + e.message);
                callback('error');
            });

            req.write(postData);
            req.end();
        }

        this.postTicketData = function(customer_id, template, subj, group_id, cat_id, username, password, callback)
        {
            let cat_array = [];
            cat_array.push(cat_id);
            let postData;
            if(customer_id) {
                postData = JSON.stringify({
                    subject: subj,
                    type: "internal",
                    ticket_group_id: group_id,
                    assignee: "accounts",
                    assignee_id: customer_id,
                    category_ids: cat_array,
                    comment: template
                });
            } else {
                postData = JSON.stringify({
                    subject: subj,
                    type: "internal",
                    ticket_group_id: group_id,
                    category_ids: cat_array,
                    comment: template
                });
            }

            options.path = '/api/v1/tickets';
            options.headers = {
                'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64'),
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            };
            options.method = 'POST';

            console.log(postData);

            let req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    callback(JSON.parse(body));
                });
            });

            req.on('error', (e) => {
                console.log('ERROR w/ POST: ' + e.message);
                callback('error');
            });

            req.write(postData);
            req.end();
        }

        this.postData = function(customer_id, template, tkt_id, job_type_id, username, password, callback)
        {
            let postData = JSON.stringify(
                {
                    job_type_id: job_type_id,
                    assigned_id: customer_id,
                    assigned_type: 'accounts',
                    notes: template,
                    ticket_id: tkt_id
                }
            );

            options.path = '/api/v1/scheduling/jobs';
            options.headers = {
                'Authorization': 'Basic ' + new Buffer(username+':'+password).toString('base64'),
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            };
            options.method = 'POST';

            //callback(template, apiData);
            console.log(postData);

            let req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    callback(JSON.parse(body));
                });
            });

            req.on('error', (e) => {
                console.log('ERROR w/ POST: ' + e.message);
                callback('error');
            });

            req.write(postData);
            req.end();
        }
    }
};

module.exports = Sonar;