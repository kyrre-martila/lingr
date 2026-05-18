import { ok } from '../http/envelope.js'
import { viewerMeta } from '../http/auth-safe.js'
import { checkRegionAvailability, listCountries, listRegionsByCountry, voteForRegion } from '../services/region-service.js'

const respond = (req, res, statusCode, data) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(ok(data, { requestId: req.requestId, ...viewerMeta(req.viewer) })))
}

export const listCountriesRoute = async (req, res) => respond(req, res, 200, await listCountries())
export const listRegionsByCountryRoute = async (req, res) => respond(req, res, 200, await listRegionsByCountry({ countryCode: req.params.countryCode, locale: req.query?.locale }))
export const checkRegionRoute = async (req, res) => respond(req, res, 200, await checkRegionAvailability({ countryCode: req.query?.countryCode, regionSlug: req.query?.regionSlug }))
export const voteRegionRoute = async (req, res) => respond(req, res, 201, await voteForRegion({ countryCode: req.body?.countryCode, regionSlug: req.body?.regionSlug, email: req.body?.email, firstName: req.body?.firstName, locale: req.body?.locale }))
