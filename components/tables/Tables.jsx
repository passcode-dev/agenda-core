import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import React, { useState } from "react";

function Tables({
    data,
    columns,
    setSelectedLine,
    clickable
}) {
    const isListValid = Array.isArray(data) && data.length > 0;
    return (
        <>
            <Table className="w-full border-spacing-y-2">
                {isListValid ? (
                    <>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.field}
                                        className="px-4 py-2 font-bold text-center align-middle"
                                    >
                                        {column.headerName}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow onClick={clickable ? ()=>setSelectedLine(row): undefined} key={rowIndex} className="text-center align-middle" >
                                    
                                    {columns.map((col) => (

                                        <TableCell key={`${col.headerName}.${col.field}`} className="px-4 py-2 align-middle">
                                            {col.renderCell
                                                ? col.renderCell({ row })
                                                : row[col.field]
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </>
                ) : (
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-4">
                                Nenhum dado disponível
                            </TableCell>
                        </TableRow>
                    </TableBody>
                )}
            </Table>
        </>

    );
}

export default Tables;

