import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const SalesReport = () => {
  const { store, actions } = useContext(Context);
  const [filter, setFilter] = useState("daily");

  useEffect(() => {
    actions.getSalesReport(filter);
  }, [filter]);

  return (
    <div className="container mt-4">
      <h2>Reporte de Ventas</h2>

      <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="daily">Diario</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensual</option>
        <option value="yearly">Anual</option>
      </select>

      {store.salesReport ? (
        <div className="mt-3">
          <h4>Total Ventas: {store.salesReport.total_sales}</h4>
          <h4>Ingresos Totales: ${store.salesReport.total_revenue.toFixed(2)}</h4>

          <h5 className="mt-4">Productos Vendidos</h5>
          {store.salesReport.products_sold.length > 0 ? (
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad Vendida</th>
                  <th>Ingresos Generados</th>
                </tr>
              </thead>
              <tbody>
                {store.salesReport.products_sold.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>${product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay productos vendidos en este período.</p>
          )}
        </div>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default SalesReport;