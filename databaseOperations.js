export default class DatabaseOperations {
   static insertIntoDb = (async (modelInstance) => {
      await modelInstance.save();
   })

   static selectFromDb = async (model) => {
      return await model.findAll();
   };

   static deleteFromDb = async (model, id) => {
      await model.destroy({
         where: { id: id },
      });
   };

   // This updates the database structure with SQL code and executes immediately when this script runs.
   static updateDatabase = (async (database) => {
      await database.sequelize.sync({force: true});
   });
}