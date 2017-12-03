var RecrutForm = function () {

    return {
        
        //Recrutement Form
        initRecrutForm: function () {
	        // Validation
	        $("#formApply").validate({
	            // Rules for form validation
	            rules:
	            {
	                contact_email:{
	                    required: true,
	                    email: true },
	                lien_armu:{
	                    required: true,
                            url: true },
                        presentation:{
                            required: true,
                            minlength: 10 },
                        date_play:{
                            required: true },
                        xp_pve:{
                            required: true,
                            minlength: 10 },
                        motivation:{
                            required: true,
                            minlength: 10 },
                        old_guild:{
                            required: true },
                        interface:{
                            required: true,
                            minlength: 10 },
                        tc:{
                            required: true,
                            minlength: 10 },
	            },
	                                
	            // Messages for form validation
	            messages:
	            {
	                contact_email:{
	                    required: 'Adresse Email obligatoire afin de pouvoir vous contacter',
	                    email: 'Il faut une adresse Email valide !' },
                        lien_armu:{
	                    required: 'Lien armurie obligatoire et valide',
                            url: 'Il faut une url valide !' },
                        presentation:{
                            required: "Votre présentation est obligatoire",
                            minlength: "Il faut un minimum de 10 caractères" },
                        date_play:{
                            required: "Votre temps de jeu est obligatoire" },
                        xp_pve:{
                            required: "Votre experience est obligatoire",
                            minlength: "Il faut un minimum de 10 caractères" },
                        motivation:{
                            required: "Votre motivation est obligatoire",
                            minlength: "Il faut un minimum de 10 caractères" },
                        old_guild:{
                            required: "Vos anciennes guildes nous interessent" },
                        interface:{
                            required: "Votre interface est obligatoire",
                            minlength: "Il faut un minimum de 10 caractères" },
                        tc:{
                            required: "Votre théorycraft est obligatoire",
                            minlength: "Il faut un minimum de 10 caractères" }
	            },
	                                
	            // Ajax form submition                  
	            submitHandler: function(form)
	            {
	                $(form).ajaxSubmit(
	                {
	                    beforeSend: function()
	                    {
	                        $('#formApply button[type="submit"]').attr('disabled', true);
	                    },
	                    success: function()
	                    {
	                        $("#formApply").addClass('submited');
	                    }
	                });
	            },
	            
	            // Do not change code below
	            errorPlacement: function(error, element)
	            {
	                error.insertAfter(element.parent());
	            }
	        });
        }

    };
    
}();