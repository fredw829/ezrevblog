
'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Grant public permissions for 'post'
    const postPermissions = [
      {
        action: 'api::post.post.find',
        role: 'public',
      },
      {
        action: 'api::post.post.findOne',
        role: 'public',
      },
    ];

    const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
      filters: {
        type: 'public',
      },
    });

    if (roles && roles.length > 0) {
      const publicRole = roles[0];

      const allPermissions = await strapi.entityService.findMany('plugin::users-permissions.permission', {
        populate: ['role'],
      });

      for (const permission of postPermissions) {
        const existingPermission = allPermissions.find(
          (p) => p.action === permission.action && p.role.type === 'public'
        );

        if (!existingPermission) {
          const newPermission = await strapi.entityService.create('plugin::users-permissions.permission', {
            data: {
              action: permission.action,
              role: publicRole.id,
            },
          });
        }
      }
    }
  },
};
