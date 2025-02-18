import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";

const SalesReport = () => {
  const { store, actions } = useContext(Context);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    actions.getSalesReport(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <div className="container mt-4">
      <h2>Reporte de Ventas</h2>

      <div className="d-flex gap-3">
        <div>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Fecha de Fin:</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

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
