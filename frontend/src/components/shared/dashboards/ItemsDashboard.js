import ItemDashboard from "./ItemDashboard";

const ItemsDashboard = ({ item }) => {
  const { title, items } = item;
  return (
    <>
      <h5 className="text-sm leading-1 font-semibold uppercase text-contentColor dark:text-contentColor-dark bg-lightGrey5 dark:bg-whiteColor-dark p-10px pb-7px mt-5 mb-10px tracking-half">
        {title}
      </h5>
      <ul>
        {items?.map((item1, idx) => (
          <ItemDashboard key={idx} item={item1} />
        ))}
      </ul>
    </>
  );
};

export default ItemsDashboard;
